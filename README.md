# Guruji
Guruji is a MCP server that can generate tools based on your needs and a sophisticated chat bot that can invoke chat with memory and can invoke tools for better performance 

## Backend API

The backend is a FastAPI application that provides a set of APIs for managing chat sessions, tools, knowledge bases, and database connections.

### Running the Backend Server

To run the backend server, navigate to the `backend` directory and run the following command:

```bash
uvicorn main:app --reload
```

The server will be available at `http://localhost:8000`.

### Knowledge Base Hub

The Knowledge Base Hub allows you to manage knowledge bases that can be used by the chat agents.

**Endpoints:**

*   **`POST /kb/create`**: Creates a new knowledge base.
    *   **Request Body:** `KnowledgeBaseRequest` model.
    *   **Example:**
        ```bash
        curl -X POST http://localhost:8000/kb/create \
        -H "Content-Type: application/json" \
        -d '{
          "kb_name": "My KB",
          "vector_store": "ChromaDB",
          "allowed_file_types": [".pdf", ".txt"],
          "parsing_library": "PyPDF",
          "chunking_strategy": "fixed-size",
          "chunk_size": 512,
          "chunk_overlap": 64,
          "metadata_strategy": "basic"
        }'
        ```

*   **`GET /kb/list`**: Lists all available knowledge bases.

*   **`GET /kb/{kb_id}`**: Retrieves a single knowledge base by its ID.

*   **`PUT /kb/{kb_id}`**: Updates an existing knowledge base.
    *   **Request Body:** `KnowledgeBaseRequest` model.

*   **`DELETE /kb/{kb_id}`**: Deletes a knowledge base.

### Tools Hub

The Tools Hub allows you to create, manage, and use custom tools.

**Endpoints:**

*   **`POST /tools/create`**: Creates a new custom tool.
    *   **Request Body:** `CustomToolCreate` model.
    *   **Example:**
        ```bash
        curl -X POST http://localhost:8000/tools/create \
        -H "Content-Type: application/json" \
        -d '{
          "name": "my_adder",
          "description": "A simple tool that adds two numbers.",
          "code": "def my_adder(a: int, b: int) -> int: return a + b"
        }'
        ```

*   **`GET /tools`**: Lists all available tools (default and custom).

*   **`GET /tools/{tool_id}`**: Retrieves a single custom tool by its ID.

*   **`PUT /tools/{tool_id}`**: Updates an existing custom tool.
    *   **Request Body:** `CustomToolCreate` model.

*   **`DELETE /tools/{tool_id}`**: Deletes a custom tool.

### Prompt Hub

The Prompt Hub allows you to manage prompts that can be used in the chat.

**Endpoints:**

*   **`POST /prompts/create`**: Creates a new prompt.
    *   **Request Body:** `PromptCreate` model.
    *   **Example:**
        ```bash
        curl -X POST http://localhost:8000/prompts/create \
        -H "Content-Type: application/json" \
        -d '{
          "name": "My Prompt",
          "text": "This is my custom prompt."
        }'
        ```

*   **`GET /prompts/list`**: Lists all available prompts.

*   **`GET /prompts/{prompt_id}`**: Retrieves a single prompt by its ID.

*   **`PUT /prompts/{prompt_id}`**: Updates an existing prompt.
    *   **Request Body:** `PromptCreate` model.

*   **`DELETE /prompts/{prompt_id}`**: Deletes a prompt.

### Database Hub

The Database Hub allows you to manage database connection configurations.

**Endpoints:**

*   **`POST /databases/create`**: Creates a new database connection.
    *   **Request Body:** `DatabaseConnectionCreate` model.
    *   **Example:**
        ```bash
        curl -X POST http://localhost:8000/databases/create \
        -H "Content-Type: application/json" \
        -d '{
          "name": "My DB",
          "db_type": "PostgreSQL",
          "host": "localhost",
          "port": 5432,
          "username": "admin",
          "password": "password"
        }'
        ```

*   **`GET /databases/list`**: Lists all available database connections.

*   **`GET /databases/{db_id}`**: Retrieves a single database connection by its ID.

*   **`PUT /databases/{db_id}`**: Updates an existing database connection.
    *   **Request Body:** `DatabaseConnectionCreate` model.

*   **`DELETE /databases/{db_id}`**: Deletes a database connection.
