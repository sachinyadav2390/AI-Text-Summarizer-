# Project Diagrams & Flowcharts

This document provides a set of visual representations of the **Text Summarization using Transformers** project. These diagrams illustrate the architecture, data flow, and user workflows.

---

## 1. High-Level System Architecture

This diagram shows the core components of the application and how they interact.

```mermaid
graph TD
    User((User)) -->|Browser| Frontend[Next.js Frontend]
    Frontend -->|HTTP / API| Backend[Express.js Backend]
    
    subgraph "Backend Services"
        Backend -->|Summarization Request| AIService[Python AI Service]
        Backend -->|Store Summary| MongoDB[(MongoDB Database)]
        Backend -->|Send Summary| MailService[Nodemailer / SMTP]
    end
    
    subgraph "AI Core (FastAPI)"
        AIService -->|Transformer Inference| Models{BART / T5 / Pegasus}
        AIService -->|Extractive Fallback| Extractive[Keyword Frequency Engine]
    end
    
    Frontend -.->|Auth / Profile| MongoDB
```

---

## 2. Summarization Sequence Diagram

The step-by-step process of a user requesting a summary and receiving the result.

```mermaid
sequenceDiagram
    participant User
    participant Frontend as Next.js Web App
    participant Backend as Express API
    participant AI as Python AI Engine
    participant DB as MongoDB

    User->>Frontend: Input Text / Upload File
    Frontend->>Backend: POST /api/summarize (Text + Params)
    
    Backend->>AI: POST /ai/summarize
    ALT AI Service Healthy
        AI-->>Backend: Return Abstractive Summary (BART/T5)
    ELSE AI Service Down
        Backend->>Backend: Execute Extractive Fallback
    END
    
    Backend->>DB: Save Summary to History
    Backend-->>Frontend: Return Result (Summary, Stats, Keywords)
    Frontend-->>User: Display Summary & Dashboard
```

---

## 3. File Upload & Processing Flowchart

Detailed flow for handling various file types and extracting text before summarization.

```mermaid
flowchart LR
    Start([Upload File]) --> ExtCheck{Check Ext}
    
    ExtCheck -->|.txt| ReadTxt[Read as Plain Text]
    ExtCheck -->|.pdf| ReadPdf[Extract via pdf-parse]
    ExtCheck -->|.docx| ReadDocx[Extract via Mammoth]
    ExtCheck -->|Other| Reject([Reject Format])
    
    ReadTxt --> Clean[Normalize Text]
    ReadPdf --> Clean
    ReadDocx --> Clean
    
    Clean --> Process([Ready for Summarization])
```

---

## 4. User Journey Flowchart

The overall experience for a guest or registered user.

```mermaid
flowchart TD
    A[Landing Page] --> B{Action?}
    B -->|Paste Text| C[Text Area Input]
    B -->|Upload File| D[File Dropzone]
    B -->|Enter URL| E[URL Scraper]
    
    C --> F[Click Summarize]
    D --> F
    E --> F
    
    F --> G{Process?}
    G -->|Success| H[View Summary Result]
    G -->|Error| I[Show Error Message]
    
    H --> J{Options}
    J -->|Email| K[Send to Mail]
    J -->|Save| L[Add to History]
    J -->|Copy| M[Copy to Clipboard]
    
    L --> N([Dashboard / Profile])
```

---

## 5. Data Flow Diagram (Level 1)

How information flows through the system's internal processes.

```mermaid
graph LR
    Input[User Input] --> ProcessText[Text Processing Node]
    ProcessText --> Tokenizer[AI Tokenizer]
    Tokenizer --> Transformer[Transformer Model]
    Transformer --> Summary[Raw Summary]
    
    Summary --> PostProcess[Formatting & Translation]
    PostProcess --> Output[Final Summary Result]
    
    Summary -.-> History[History Buffer]
    History --> Store[(Database Store)]
```
