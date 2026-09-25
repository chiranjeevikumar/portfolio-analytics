import os
import resend
from dotenv import load_dotenv

load_dotenv()

resend.api_key = os.getenv("RESEND_API_KEY", "")
FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL", "noreply@example.com")
FROM_NAME = os.getenv("RESEND_FROM_NAME", "Portfolio Analytics")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


def send_visit_notification(owner_email: str, owner_name: str, visitor_info: dict):
    """Notify portfolio owner when someone visits their portfolio."""
    city = visitor_info.get("city", "Unknown")
    country = visitor_info.get("country", "Unknown")
    device = visitor_info.get("device_type", "Unknown")
    page = visitor_info.get("page_type", "portfolio")

    html = f"""
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f23; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 8px;">👁️</div>
        <h1 style="margin: 0; color: white; font-size: 22px;">Someone visited your portfolio!</h1>
      </div>
      <div style="padding: 32px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #1e1e3f; color: #94a3b8;">📍 Location</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #1e1e3f; font-weight: 600;">{city}, {country}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #1e1e3f; color: #94a3b8;">💻 Device</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #1e1e3f; font-weight: 600;">{device}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #94a3b8;">📄 Page</td>
            <td style="padding: 12px 0; font-weight: 600;">{page}</td>
          </tr>
        </table>
        <div style="margin-top: 32px; text-align: center;">
          <a href="{FRONTEND_URL}/dashboard" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">View Dashboard →</a>
        </div>
      </div>
      <div style="background: #1e1e3f; padding: 16px; text-align: center; color: #64748b; font-size: 12px;">
        Portfolio Analytics — Real-time visitor intelligence
      </div>
    </div>
    """

    try:
        resend.Emails.send({
            "from": f"{FROM_NAME} <{FROM_EMAIL}>",
            "to": [owner_email],
            "subject": f"👁️ New visitor on your portfolio",
            "html": html
        })
    except Exception as e:
        print(f"Email error (visit notification): {e}")


def send_connect_notification(owner_email: str, owner_name: str, connection: dict):
    """Notify portfolio owner when someone sends a connect request."""
    name = connection.get("name", "Someone")
    email = connection.get("email", "")
    interest = connection.get("interest_type", "").replace("_", " ").title()
    message = connection.get("message", "")

    html = f"""
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f23; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 32px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 8px;">🤝</div>
        <h1 style="margin: 0; color: white; font-size: 22px;">New Connection Request!</h1>
      </div>
      <div style="padding: 32px;">
        <div style="background: #1e1e3f; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h2 style="margin: 0 0 4px; font-size: 20px;">{name}</h2>
          <p style="margin: 0; color: #94a3b8;">{email}</p>
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #1e1e3f; color: #94a3b8;">🎯 Interest</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #1e1e3f; font-weight: 600;">{interest}</td>
          </tr>
        </table>
        <div style="background: #1e1e3f; border-radius: 8px; padding: 16px; margin-top: 20px;">
          <p style="margin: 0; color: #94a3b8; font-size: 12px; margin-bottom: 8px;">MESSAGE</p>
          <p style="margin: 0; font-style: italic;">"{message}"</p>
        </div>
        <div style="margin-top: 32px; text-align: center; display: flex; gap: 12px; justify-content: center;">
          <a href="mailto:{email}" style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 14px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Reply to {name}</a>
          <a href="{FRONTEND_URL}/dashboard/connections" style="background: #1e1e3f; color: white; padding: 14px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; border: 1px solid #6366f1;">View Dashboard →</a>
        </div>
      </div>
    </div>
    """

    try:
        resend.Emails.send({
            "from": f"{FROM_NAME} <{FROM_EMAIL}>",
            "to": [owner_email],
            "subject": f"🤝 {name} wants to connect with you!",
            "html": html
        })
    except Exception as e:
        print(f"Email error (connect notification): {e}")


def send_daily_summary(owner_email: str, owner_name: str, stats: dict):
    """Send daily summary email."""
    html = f"""
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f23; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 8px;">📊</div>
        <h1 style="margin: 0; color: white; font-size: 22px;">Your Daily Portfolio Summary</h1>
        <p style="margin: 8px 0 0; color: rgba(255,255,255,0.8);">Hi {owner_name} 👋</p>
      </div>
      <div style="padding: 32px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
          <div style="background: #1e1e3f; border-radius: 8px; padding: 20px; text-align: center;">
            <div style="font-size: 32px; font-weight: 700; color: #6366f1;">{stats.get('visitors_today', 0)}</div>
            <div style="color: #94a3b8; font-size: 14px;">Visitors Today</div>
          </div>
          <div style="background: #1e1e3f; border-radius: 8px; padding: 20px; text-align: center;">
            <div style="font-size: 32px; font-weight: 700; color: #8b5cf6;">{stats.get('unique_today', 0)}</div>
            <div style="color: #94a3b8; font-size: 14px;">Unique Visitors</div>
          </div>
          <div style="background: #1e1e3f; border-radius: 8px; padding: 20px; text-align: center;">
            <div style="font-size: 32px; font-weight: 700; color: #10b981;">{stats.get('project_views_today', 0)}</div>
            <div style="color: #94a3b8; font-size: 14px;">Project Views</div>
          </div>
          <div style="background: #1e1e3f; border-radius: 8px; padding: 20px; text-align: center;">
            <div style="font-size: 32px; font-weight: 700; color: #f59e0b;">{stats.get('connections_today', 0)}</div>
            <div style="color: #94a3b8; font-size: 14px;">New Leads</div>
          </div>
        </div>
        <div style="margin-top: 32px; text-align: center;">
          <a href="{FRONTEND_URL}/dashboard" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">View Full Analytics →</a>
        </div>
      </div>
    </div>
    """

    try:
        resend.Emails.send({
            "from": f"{FROM_NAME} <{FROM_EMAIL}>",
            "to": [owner_email],
            "subject": f"📊 Daily Portfolio Summary — {stats.get('visitors_today', 0)} visitors today",
            "html": html
        })
    except Exception as e:
        print(f"Email error (daily summary): {e}")
