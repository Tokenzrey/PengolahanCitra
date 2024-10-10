from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from src.routes.route import init_routes

app = FastAPI()

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # This allows all domains, adjust if necessary for production
    allow_credentials=True,
    allow_methods=["*"],  # This allows all HTTP methods
    allow_headers=["*"],  # This allows all headers
)

init_routes(app)

@app.exception_handler(404)
async def not_found_handler(request, exc):
    return {"error": "Resource not found"}, 404

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return {"error": str(exc.detail)}, exc.status_code

@app.exception_handler(500)
async def internal_server_error_handler(request, exc):
    return {"error": "Internal Server Error"}, 500

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
