"""
Repair cost database for common MOT failures
Prices are average estimates in GBP based on UK market data
Last updated: 2025-12-16
"""

from typing import Dict, List, Optional
import re

# Comprehensive repair cost database
REPAIR_COSTS = {
    # Brakes
    "brake": {
        "patterns": [
            r"brake.*pad",
            r"brake.*disc",
            r"brake.*worn",
            r"brake.*efficiency",
            r"handbrake",
            r"parking brake"
        ],
        "min_cost": 80,
        "max_cost": 400,
        "average_cost": 180,
        "description": "Brake pads/discs replacement"
    },
    
    # Tyres
    "tyre": {
        "patterns": [
            r"tyre.*tread",
            r"tyre.*worn",
            r"tyre.*damaged",
            r"tyre.*illegal",
            r"tire"
        ],
        "min_cost": 50,
        "max_cost": 200,
        "average_cost": 100,
        "description": "Tyre replacement (per tyre)"
    },
    
    # Suspension
    "suspension": {
        "patterns": [
            r"suspension",
            r"shock absorber",
            r"spring.*worn",
            r"bush.*worn"
        ],
        "min_cost": 150,
        "max_cost": 600,
        "average_cost": 350,
        "description": "Suspension component replacement"
    },
    
    # Lights
    "lights": {
        "patterns": [
            r"headlamp",
            r"headlight",
            r"light.*not.*work",
            r"bulb",
            r"lamp.*inoperative",
            r"indicator"
        ],
        "min_cost": 10,
        "max_cost": 150,
        "average_cost": 40,
        "description": "Light/bulb replacement"
    },
    
    # Exhaust
    "exhaust": {
        "patterns": [
            r"exhaust.*leak",
            r"exhaust.*excessive",
            r"exhaust.*insecure",
            r"silencer"
        ],
        "min_cost": 80,
        "max_cost": 800,
        "average_cost": 250,
        "description": "Exhaust system repair/replacement"
    },
    
    # Steering
    "steering": {
        "patterns": [
            r"steering.*play",
            r"steering.*loose",
            r"track rod",
            r"steering.*worn"
        ],
        "min_cost": 100,
        "max_cost": 500,
        "average_cost": 250,
        "description": "Steering component repair"
    },
    
    # Windscreen/wipers
    "windscreen": {
        "patterns": [
            r"windscreen.*damaged",
            r"wiper.*inoperative",
            r"wiper.*blade",
            r"windscreen.*washer"
        ],
        "min_cost": 15,
        "max_cost": 300,
        "average_cost": 50,
        "description": "Windscreen/wiper repair"
    },
    
    # Emissions
    "emissions": {
        "patterns": [
            r"emission.*excessive",
            r"emission.*control",
            r"lambda",
            r"catalytic converter"
        ],
        "min_cost": 100,
        "max_cost": 1500,
        "average_cost": 400,
        "description": "Emissions system repair"
    },
    
    # Body/chassis
    "body": {
        "patterns": [
            r"body.*corrosion",
            r"chassis.*corrosion",
            r"rust",
            r"structure.*corrosion",
            r"sill.*corroded"
        ],
        "min_cost": 200,
        "max_cost": 2000,
        "average_cost": 800,
        "description": "Bodywork/corrosion repair"
    },
    
    # Mirrors
    "mirrors": {
        "patterns": [
            r"mirror.*missing",
            r"mirror.*insecure",
            r"mirror.*damaged"
        ],
        "min_cost": 20,
        "max_cost": 150,
        "average_cost": 60,
        "description": "Mirror replacement"
    },
    
    # Seatbelts
    "seatbelts": {
        "patterns": [
            r"seat belt",
            r"seatbelt",
            r"restraint"
        ],
        "min_cost": 50,
        "max_cost": 300,
        "average_cost": 120,
        "description": "Seatbelt repair/replacement"
    },
    
    # Registration plate
    "registration_plate": {
        "patterns": [
            r"registration plate",
            r"number plate"
        ],
        "min_cost": 15,
        "max_cost": 50,
        "average_cost": 25,
        "description": "Registration plate replacement"
    },
    
    # Oil leak
    "oil_leak": {
        "patterns": [
            r"oil.*leak",
            r"fluid.*leak"
        ],
        "min_cost": 50,
        "max_cost": 500,
        "average_cost": 200,
        "description": "Oil/fluid leak repair"
    },
    
    # Horn
    "horn": {
        "patterns": [
            r"horn.*inoperative",
            r"horn.*not.*work"
        ],
        "min_cost": 20,
        "max_cost": 80,
        "average_cost": 40,
        "description": "Horn repair"
    },
    
    # Doors
    "doors": {
        "patterns": [
            r"door.*insecure",
            r"door.*not.*close"
        ],
        "min_cost": 50,
        "max_cost": 300,
        "average_cost": 150,
        "description": "Door mechanism repair"
    }
}


def estimate_repair_cost(failure_text: str) -> Dict[str, any]:
    """
    Estimate repair cost based on failure description
    
    Args:
        failure_text: The MOT failure/advisory text
        
    Returns:
        Dictionary containing cost estimate
    """
    failure_lower = failure_text.lower()
    
    for category, data in REPAIR_COSTS.items():
        for pattern in data["patterns"]:
            if re.search(pattern, failure_lower):
                return {
                    "category": category,
                    "min_cost": data["min_cost"],
                    "max_cost": data["max_cost"],
                    "average_cost": data["average_cost"],
                    "description": data["description"],
                    "matched_text": failure_text
                }
    
    # Default estimate for unknown issues
    return {
        "category": "unknown",
        "min_cost": 50,
        "max_cost": 500,
        "average_cost": 200,
        "description": "General repair",
        "matched_text": failure_text
    }


def calculate_total_repair_costs(failures: List[Dict]) -> Dict[str, any]:
    """
    Calculate total estimated repair costs from list of failures
    
    Args:
        failures: List of failure/advisory items from MOT test
        
    Returns:
        Dictionary with cost breakdown
    """
    total_min = 0
    total_max = 0
    total_average = 0
    breakdown = []
    dangerous_items = []
    
    for failure in failures:
        failure_text = failure.get("text", "")
        is_dangerous = failure.get("dangerous", False)
        
        estimate = estimate_repair_cost(failure_text)
        
        total_min += estimate["min_cost"]
        total_max += estimate["max_cost"]
        total_average += estimate["average_cost"]
        
        breakdown.append({
            "issue": failure_text,
            "estimate": estimate,
            "dangerous": is_dangerous
        })
        
        if is_dangerous:
            dangerous_items.append(failure_text)
    
    return {
        "total_min_cost": round(total_min, 2),
        "total_max_cost": round(total_max, 2),
        "total_average_cost": round(total_average, 2),
        "breakdown": breakdown,
        "dangerous_items_count": len(dangerous_items),
        "dangerous_items": dangerous_items,
        "currency": "GBP",
        "disclaimer": "Estimates may vary by location, vehicle type, and parts availability. This is for guidance only.",
        "last_updated": "2025-12-16"
    }


def get_all_repair_costs() -> Dict[str, any]:
    """
    Get all repair cost categories
    
    Returns:
        Dictionary of all repair cost categories
    """
    return {
        category: {
            "min_cost": data["min_cost"],
            "max_cost": data["max_cost"],
            "average_cost": data["average_cost"],
            "description": data["description"]
        }
        for category, data in REPAIR_COSTS.items()
    }


def get_repair_history_summary(mot_tests: List[Dict]) -> Dict[str, any]:
    """
    Analyze MOT history to identify recurring issues
    
    Args:
        mot_tests: List of MOT test results
        
    Returns:
        Summary of repair history
    """
    issue_frequency = {}
    total_failures = 0
    total_advisories = 0
    
    for test in mot_tests:
        rfr_items = test.get("rfrAndComments", [])
        
        for item in rfr_items:
            failure_text = item.get("text", "")
            item_type = item.get("type", "")
            
            estimate = estimate_repair_cost(failure_text)
            category = estimate["category"]
            
            if category not in issue_frequency:
                issue_frequency[category] = {
                    "count": 0,
                    "description": estimate["description"],
                    "examples": []
                }
            
            issue_frequency[category]["count"] += 1
            
            if len(issue_frequency[category]["examples"]) < 3:
                issue_frequency[category]["examples"].append(failure_text)
            
            if item_type == "FAIL":
                total_failures += 1
            elif item_type in ["ADVISORY", "USER ENTERED"]:
                total_advisories += 1
    
    # Sort by frequency
    sorted_issues = sorted(
        issue_frequency.items(),
        key=lambda x: x[1]["count"],
        reverse=True
    )
    
    return {
        "total_failures": total_failures,
        "total_advisories": total_advisories,
        "recurring_issues": dict(sorted_issues[:5]),  # Top 5
        "all_issues": dict(sorted_issues)
    }
