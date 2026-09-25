import httpx


async def get_location_from_ip(ip: str) -> dict:
    """Get approximate geolocation from IP address using ip-api.com (free, no key needed)."""
    # Skip for localhost/private IPs
    private_prefixes = ("127.", "192.168.", "10.", "172.", "::1", "localhost")
    if not ip or any(ip.startswith(p) for p in private_prefixes):
        return {"country": "Local", "city": "Localhost", "region": ""}

    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(f"http://ip-api.com/json/{ip}?fields=country,city,regionName,status")
            data = resp.json()
            if data.get("status") == "success":
                return {
                    "country": data.get("country", "Unknown"),
                    "city": data.get("city", "Unknown"),
                    "region": data.get("regionName", ""),
                }
    except Exception:
        pass
    return {"country": "Unknown", "city": "Unknown", "region": ""}
