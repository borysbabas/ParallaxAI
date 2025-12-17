from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from controllers.assumptions_controller import router as assumptions_controller
from controllers.auth_controller import router as auth_controller
from controllers.database_controller import router as database_controller
from controllers.form_controller import router as form_controller
from controllers.status_controller import router as status_controller

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:5173",  # Vite default port
    "https://parallax-darktech.nl",
    "https://www.parallax-darktech.nl",
    "capacitor://localhost",  # Capacitor iOS
    "ionic://localhost",  # Capacitor iOS alternative
    "http://localhost",  # Capacitor Android
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(assumptions_controller)
app.include_router(status_controller)
app.include_router(database_controller)
app.include_router(auth_controller)
app.include_router(form_controller)
