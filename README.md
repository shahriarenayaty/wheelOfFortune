# Wheel of Fortune - Microservice Project

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com)
[![License](https://img.shields.io/badge/license-MIT-blue)](https://github.com)
[![TypeScript](https://img.shields.io/badge/language-TypeScript-blue)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/framework-NestJS-red)](https://nestjs.com/)
[![MoleculerJS](https://img.shields.io/badge/framework-MoleculerJS-blueviolet)](https://moleculer.services/)

## Introduction

This project implements a gamified "Wheel of Fortune" system using a microservice architecture. The core purpose is to provide a platform where users can earn points through various activities (registration, referrals, purchases) and then spend those points to spin a wheel for a chance to win prizes.

The system is built as a distributed network of services using **NestJS** for the API Gateway and the **MoleculerJS** framework for backend services. Communication is handled asynchronously via a **NATS** message broker, with **MongoDB** serving as the persistent data store. The entire application is containerized with **Docker** for consistent development and deployment environments.

## Features

-   **User Authentication:** Secure registration and login using a phone number and password.
-   **Gamification & Point System:**
    -   **Registration Bonus:** Users receive one point upon successful registration.
    -   **Referral System:** Each user gets a unique referral code. When a new user signs up and redeems a code, both the referrer and the new user receive one point. A user can only redeem one code, but their own code can be used an unlimited number of times.
    -   **Purchase Rewards:** Users earn points for making purchases.
        -   Purchases over 100,000 Toman: **1 point**.
        -   Purchases over 200,000 Toman: **2 points**.
-   **Wheel of Fortune:**
    -   Users can spend their accumulated points to spin the wheel.
    -   Prizes are determined by a weighted probability system.
    -   A dynamic prize pool ensures that certain prizes (all except lottery chances) can only be won once per user.
-   **Prize History:** Users can view a complete history of all the prizes they have won.

## Architecture Overview

The system is composed of several independent microservices that communicate with each other through API calls (via the gateway) and asynchronous events (via NATS). This decoupled design enhances scalability, resilience, and maintainability.

### System Diagram

```mermaid
graph TD
    A[Client App] --> B{API Gateway (NestJS)};

    subgraph "Services"
        B --> C[Auth Service];
        B --> D[Order Service];
        B --> E[Gamification Service];
        B --> F[Wheel of Fortune Service];
        B --> G[History Service];
    end

    subgraph "Event Bus (NATS)"
        direction LR
        C -- "user.registered" --> E;
        F -- "prize.won" --> G;
    end

    subgraph "Database (MongoDB)"
        C --> H{DB};
        D --> H;
        E --> H;
        F --> H;
        G --> H;
    end
```

### Service Breakdown

-   **`api-gateway`**: The single entry point for all client requests, built with NestJS. It authenticates requests and routes them to the appropriate downstream service.
-   **`auth-service`**: Manages user registration, login, and the generation of JWTs.
-   **`order-service`**: Handles order creation and payment simulation, awarding points upon successful payment.
-   **`gamification-service`**: Manages user points, balances, and the logic for redeeming referral codes.
-   **`wheel-of-fortune-service`**: Contains the core logic for spinning the wheel, calculating weighted prize outcomes, and emitting `prize.won` events.
-   **`history-service`**: Consumes `prize.won` events to record prize history and provides an endpoint for users to retrieve their winnings.

## Technology Stack

-   **Backend Frameworks:** NestJS (API Gateway), MoleculerJS (Microservices)
-   **Language:** TypeScript
-   **Database:** MongoDB
-   **Messaging/Event Bus:** NATS
-   **Containerization:** Docker, Docker Compose
-   **Authentication:** JWT (RS256) for API calls, JWS for secure events
-   **Validation:** Zod (Environment Variables), FastestValidator (Action Parameters)

## Core Concepts

### Authentication (API Actions)

Client-to-service communication is secured using JSON Web Tokens (JWT) with the `RS256` algorithm (asymmetric keys).

1.  A user logs in via the `auth-service`, which generates a JWT signed with its **private key**.
2.  The client includes this JWT in the `Authorization` header for all subsequent requests to the `api-gateway`.
3.  The API Gateway and all downstream services possess the `auth-service`'s **public key**. They use this key to verify the token's signature on any action marked as `authenticated: true`. This ensures that the token is valid and was issued by a trusted source without needing to share a secret.

### Event-Driven Security (Service-to-Service Events)

Internal, event-based communication between services is secured using JSON Web Signatures (JWS). This prevents one service from spoofing an event from another.

1.  When a service (e.g., `wheel-of-fortune-service`) is ready to publish an event, it signs the entire event payload using its own unique **private key**.
2.  The signed payload (a JWS string) is published to NATS.
3.  The JWS header contains an `iss` (issuer) claim, which identifies the publishing service (e.g., `WHEEL_PUBLIC_KEY`).
4.  Subscriber services (e.g., `history-service`) receive the JWS. They read the `iss` claim to determine which **public key** to use for verification.
5.  The subscriber verifies the signature. If valid, it decodes the trusted payload and processes the event. If invalid, the event is discarded.

## Configuration & Environment

This project supports two primary methods for configuration, designed for different use cases: using Docker Compose for a production-like environment, and using local `.env` files for individual service development.

### Method 1: Using Docker Compose (Recommended)

This is the standard method for running the entire application. It uses a combination of environment variables set in `docker-compose.yml` and a clever entrypoint script to securely load sensitive keys from files, avoiding the need to place secrets directly into environment files or the compose file itself.

**How it Works:**

The `docker-compose.yml` file orchestrates this entire process:

1.  **Shared Key Volume (`keys-data`):**
    A named volume called `keys-data` is defined at the bottom of the file. Docker manages this volume, and its purpose is to be a shared, persistent location for the cryptographic key files (`.pem`) you generated.

    ```yaml
    volumes:
      mongo-data:
      keys-data: # This volume will hold our keys
    ```

2.  **Mounting the Volume:**
    Each service that requires access to keys has the `keys-data` volume mounted to a specific path *inside* its container: `/shared/keys`.

    ```yaml
    # In auth-service, for example:
    volumes:
      - keys-data:/shared/keys
    ```
    This means the `auth_public.pem`, `wheel_private.pem`, etc., files are now accessible inside the container at `/shared/keys/`.

3.  **Static Environment Variables:**
    Non-sensitive configuration, especially values that refer to other services within the Docker network, are set directly in the `environment` section. Notice how services connect to `nats` and `mongodb` by their service names, which Docker's internal DNS resolves.

    ```yaml
    # In auth-service:
    environment:
      - NATS_URL=nats://nats:4222
      - MONGO_URI=mongodb://mongodb:27017/wheelOfFortune
    ```

4.  **Dynamic Key Loading (The Entrypoint Script):**
    This is the key to the security model. The `entrypoint.sh` script inside each Moleculer service's Docker image runs *before* the application starts.
    -   It checks for the existence of key files inside `/shared/keys`.
    -   If a file exists (e.g., `/shared/keys/auth_public.pem`), it reads the file's content.
    -   It formats the multi-line key into a single-line string with `\n` characters.
    -   It **exports** this formatted string as an environment variable (e.g., `export AUTH_PUBLIC_KEY="..."`).
    -   Finally, it starts the Node.js application.

    This approach ensures that the application receives its keys via standard environment variables (`process.env`), but the secrets themselves live securely as files, mounted at runtime. They are not part of the container image or checked into version control.

### Method 2: Local Development with `.env` Files

This method is ideal when you want to run a single service directly on your host machine (e.g., with `npm run dev`) for faster development cycles and debugging.

**Steps:**

1.  **Run Core Dependencies:** Start the shared infrastructure using Docker Compose.
    ```bash
    docker-compose up -d nats mongodb
    ```

2.  **Create `.env` File:** In the directory of the service you want to run locally (e.g., `services/gamification-service/`), create a `.env` file.

3.  **Configure for `localhost`:** You must configure the service to connect to the Docker containers via their *exposed ports* on `localhost`, not their internal service names. You also need to provide the keys directly in this file.

    **Example `.env` for `gamification-service` (local development):**
    ```bash
    # Connect to NATS running in Docker on the host machine
    NATS_URL=nats://localhost:4222

    # Moleculer Settings
    NAMESPACE=wheelOfFortune
    NODE_ID_PREFIX=GAMIFICATION-LOCAL

    # Connect to MongoDB running in Docker on the host machine
    MONGO_URI=mongodb://localhost:27018/wheelOfFortune

    # Security Keys (copy the formatted, single-line string here)
    AUTH_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA...\n-----END PUBLIC KEY-----"
    ```

4.  **Start the Service:**
    ```bash
    # In services/gamification-service/
    npm install
    npm run dev
    ```

The service will now start on your host machine, connect to the dependencies running in Docker, and be ready for development.

---

## API Usage

Follow this sequence of API calls to test the main functionality from end to end:

1.  **Register:** `POST /auth/register` to create a new user.
2.  **Login:** `POST /auth/login` to get a JWT. Postman will automatically save this to the `tokenWheel` environment variable.
3.  **Create Order:** `POST /orders` (with Bearer Token) to create an order. Postman saves the `orderId`.
4.  **Pay for Order:** `POST /orders/:orderId/payment` to simulate payment and earn points.
5.  **Check Balance:** `GET /user/balance` (with Bearer Token) to verify that your points have been added.
6.  **Spin the Wheel:** `POST /wheel/spin` to use a point and win a prize.
7.  **Check History:** `GET /histories/prize` to see the prize you just won.
