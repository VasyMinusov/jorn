import os

bind = f"0.0.0.0:{os.getenv('PORT', 8080)}"
workers = 2
worker_class = "uvicorn.workers.UvicornWorker"
timeout = 120
graceful_timeout = 120
keepalive = 2
preload_app = True