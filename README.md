# Microservices Demo (Docker Edition)

A simple demonstration of microservices using **Node.js** + **MongoDB** + **Docker**. This project covers **4 microservices**:

1. **Auth Service** – Handles user authentication and token issuance.  
2. **User Service** – Manages user profiles, follower relationships.  
3. **Post Service** – Creates & manages social posts.  
4. **Notification Service** – Sends notifications.

---

## Table of Contents

1. [Features](#features)  
2. [Architecture](#architecture)  
3. [Tech Stack](#tech-stack)  
4. [Prerequisites](#prerequisites)  
5. [Project Structure](#project-structure)  
6. [Environment Variables](#environment-variables)  
7. [Building & Running (Docker Compose)](#building--running-docker-compose)  
8. [Usage & Testing](#usage--testing)  
9. [Future Enhancements](#future-enhancements)  
10. [License](#license)  

---

## Features

- **JWT-based** authentication with refresh tokens  
- **CRUD operations** for user profiles  
- **Following** functionality  
- **RESTful** APIs across services  
- **Docker Compose** to manage containers in local development  

---

## Architecture

Each microservice is **independently deployable** and **owns its data** in MongoDB. Services communicate mainly via **HTTP**. For example:

- **Auth Service** issues JWT tokens.  
- **User Service** verifies tokens locally (shared JWT secret) and calls Notification Service via HTTP if needed.  
- **Post Service** (if implemented) would also notify other services or request data from User Service.  
- **Notification Service** persists notifications in MongoDB (or forwards to external push/email).


---

## Tech Stack

- **Node.js** (Express + Mongoose)  
- **MongoDB** (Atlas or local container)  
- **Docker** & **Docker Compose**  
- **JWT** for auth  
- **Axios** for inter-service HTTP calls  

---

## Prerequisites

- **Docker** installed ([Download](https://www.docker.com/))  
- (Optional) **Docker Compose** if you prefer a standalone installation  
- A **MongoDB Atlas** cluster or willingness to run a local Mongo container  
- **Git** for source control  

---

## Project Structure


- **auth-service/**: Contains authentication logic (register, login, token refresh)  
- **user-service/**: CRUD + follow/unfollow features  
- **post-service/**: Manages social posts (if needed)  
- **notification-service/**: Manages & stores notifications (if needed)  
- **infra/**: Docker Compose config and shared infra scripts  

---

## Building & Running (Docker Compose)

1. **Clone the repo**  
   ```bash
   git clone https://github.com/illum1nadi/cec_assignment.git
   cd cec_assignment/infra

2. **Start all the services**  
   ```bash
   docker-compose up --build -d

3. **Verify whether the services are running**  
   ```bash
   docker ps

4. **health Checks**  
   ```bash
   curl http://localhost:4000/health   
   curl http://localhost:4001/health   
   curl http://localhost:4002/health   
   curl http://localhost:4003/health   




