import json
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load env and insert path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))
load_dotenv(backend_dir / ".env", override=True)

from database import get_db, get_cursor

def seed():
    with get_db() as conn:
        with get_cursor(conn) as cur:
            # 1. Update user info if needed
            cur.execute("SELECT id FROM users WHERE username = 'chiru'")
            user = cur.fetchone()
            if not user:
                print("[ERROR] User 'chiru' not found")
                return
            user_id = str(user["id"])

            # 2. Update Profile with full Chiranjeevi Kumar Battula details
            skills = [
                "Generative AI", "Agentic AI", "Computer Vision", "Edge AI", "Deep Learning",
                "LLMs", "RAG", "Prompt Engineering", "Vector Search", "AI Memory",
                "Tool Calling", "LangChain", "LangGraph", "MCP", "YOLO",
                "Video Analytics", "NVIDIA Jetson Nano", "Raspberry Pi", "Model Optimization (INT8/FP16)",
                "Python", "FastAPI", "Docker", "PostgreSQL"
            ]

            bio = (
                "AI/ML Engineer with 3+ years of experience building intelligent systems across "
                "Generative AI, Agentic AI, Deep Learning, Computer Vision, and Edge AI. "
                "Focused on transforming AI models into practical, scalable, production-oriented applications.\n\n"
                '"I build AI products, not just AI prototypes."'
            )

            title = "AI/ML Engineer | Generative AI | Agentic AI | Computer Vision | Edge AI"
            company = "KPMG"
            exp_years = 3
            name = "Chiranjeevi Kumar Battula"
            linkedin = "https://www.linkedin.com/in/chiranjeevikumar/"
            email_contact = "chiranjeevikumarbattula@gmail.com"

            cur.execute(
                """UPDATE profiles SET
                    name = %s,
                    title = %s,
                    company = %s,
                    experience_years = %s,
                    bio = %s,
                    linkedin_url = %s,
                    email_contact = %s,
                    skills = %s::jsonb,
                    email_visible = FALSE,
                    phone_visible = FALSE
                   WHERE user_id = %s""",
                (name, title, company, exp_years, bio, linkedin, email_contact, json.dumps(skills), user_id)
            )
            print("[OK] Profile updated for Chiranjeevi Kumar Battula")

            # 3. Clean and insert the flagship projects
            cur.execute("DELETE FROM projects WHERE user_id = %s", (user_id,))

            projects = [
                {
                    "title": "Production AI Chatbot with Long-Term Memory & RAG",
                    "description": "A production-oriented conversational AI system designed to maintain context, retrieve relevant information, and provide personalized responses across conversations.",
                    "long_description": (
                        "Combines LLM reasoning, multi-session conversation history, semantic retrieval (RAG), and persistent memory layer. "
                        "Addresses context loss in traditional chatbots by tracking conversational memory, document vectors, and providing ChatGPT-style streaming responses."
                    ),
                    "tech_stack": ["Python", "FastAPI", "LangChain", "LangGraph", "Vector DB", "RAG", "Embeddings", "PostgreSQL", "Docker", "Streaming"],
                    "capabilities": [
                        "Conversational AI", "Multi-Session History", "Long-Term Memory",
                        "RAG Vector Retrieval", "Context Management", "ChatGPT-style Streaming", "Guardrails"
                    ],
                    "demo_video_url": "https://www.youtube.com/watch?v=demo1",
                    "github_url": "https://github.com/chiranjeevikumar",
                    "live_url": "https://portfolioiq.dev/chiru/chatbot-demo",
                    "order_index": 1,
                    "is_featured": True
                },
                {
                    "title": "AI Talking Avatar & End-to-End Video Generation",
                    "description": "An end-to-end AI video generation pipeline that transforms a single facial image and user-provided text into a talking-avatar video with synthesized or cloned voice.",
                    "long_description": (
                        "End-to-end AI pipeline transforming 1 face image + text + reference audio into a photo-realistic talking avatar video. "
                        "Features voice cloning, audio-driven lip synchronization, face enhancement, and GPU-optimized rendering with FFmpeg."
                    ),
                    "tech_stack": ["Python", "Deep Learning", "Computer Vision", "Voice Cloning", "Lip Sync", "FFmpeg", "GPU Acceleration", "FastAPI", "Model Pipeline"],
                    "capabilities": [
                        "Single-Image Animation", "Voice Cloning", "Audio-Driven Lip Sync",
                        "Face Enhancement", "Audio/Video Synchronization", "GPU Pipeline Orchestration"
                    ],
                    "demo_video_url": "https://www.youtube.com/watch?v=demo2",
                    "github_url": "https://github.com/chiranjeevikumar",
                    "live_url": "https://portfolioiq.dev/chiru/avatar-demo",
                    "order_index": 2,
                    "is_featured": True
                },
                {
                    "title": "Real-Time Edge Computer Vision & Video Analytics",
                    "description": "High-speed real-time object detection and person re-identification deployed on edge devices closer to where data is generated, reducing latency and bandwidth.",
                    "long_description": (
                        "Real-time edge computer vision using YOLO and Person Re-ID deployed on NVIDIA Jetson Nano and Raspberry Pi. "
                        "Leverages FP16 and INT8 model quantization and GPU inference acceleration to achieve low latency under constrained power envelopes."
                    ),
                    "tech_stack": ["Python", "YOLO", "OpenCV", "NVIDIA Jetson Nano", "Raspberry Pi", "TensorRT", "INT8/FP16 Optimization", "Person Re-ID"],
                    "capabilities": [
                        "Real-time Object Detection", "Person Re-Identification",
                        "INT8/FP16 Quantization", "GPU Inference", "Edge Deployment"
                    ],
                    "demo_video_url": "",
                    "github_url": "https://github.com/chiranjeevikumar",
                    "live_url": "",
                    "order_index": 3,
                    "is_featured": True
                }
            ]

            for p in projects:
                cur.execute(
                    """INSERT INTO projects (
                        user_id, title, description, long_description,
                        tech_stack, capabilities, demo_video_url, github_url, live_url,
                        order_index, is_featured
                    ) VALUES (%s, %s, %s, %s, %s::jsonb, %s::jsonb, %s, %s, %s, %s, %s)""",
                    (
                        user_id, p["title"], p["description"], p["long_description"],
                        json.dumps(p["tech_stack"]), json.dumps(p["capabilities"]),
                        p["demo_video_url"], p["github_url"], p["live_url"],
                        p["order_index"], p["is_featured"]
                    )
                )

            print(f"[OK] Seeded {len(projects)} flagship projects successfully!")

if __name__ == "__main__":
    seed()
