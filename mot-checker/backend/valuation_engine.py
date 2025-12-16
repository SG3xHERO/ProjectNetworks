"""
Vehicle valuation engine
Calculates whether a vehicle is worth buying based on MOT history
"""

from typing import Dict, List, Any
from datetime import datetime, timedelta
from repair_costs import calculate_total_repair_costs, get_repair_history_summary


class ValuationEngine:
    """Engine for calculating vehicle valuations based on MOT history"""
    
    def __init__(self):
        # Scoring weights
        self.WEIGHTS = {
            "mot_history": 0.25,
            "recent_failures": 0.30,
            "dangerous_defects": 0.20,
            "mileage_consistency": 0.15,
            "age_factor": 0.10
        }
    
    def calculate_valuation(
        self,
        mot_data: Dict[str, Any],
        asking_price: float
    ) -> Dict[str, Any]:
        """
        Calculate comprehensive vehicle valuation
        
        Args:
            mot_data: MOT history data from DVLA
            asking_price: Seller's asking price
            
        Returns:
            Detailed valuation report
        """
        mot_tests = mot_data.get("motTests", [])
        
        if not mot_tests:
            return {
                "recommendation": "insufficient_data",
                "score": 0,
                "message": "No MOT history available for assessment"
            }
        
        # Calculate individual scores
        history_score = self._calculate_history_score(mot_tests)
        failure_score = self._calculate_recent_failures_score(mot_tests)
        danger_score = self._calculate_dangerous_defects_score(mot_tests)
        mileage_score = self._calculate_mileage_score(mot_tests)
        age_score = self._calculate_age_score(mot_tests)
        
        # Calculate weighted overall score (0-100)
        overall_score = (
            history_score * self.WEIGHTS["mot_history"] +
            failure_score * self.WEIGHTS["recent_failures"] +
            danger_score * self.WEIGHTS["dangerous_defects"] +
            mileage_score * self.WEIGHTS["mileage_consistency"] +
            age_score * self.WEIGHTS["age_factor"]
        )
        
        # Estimate repair costs
        repair_costs = self._estimate_immediate_repairs(mot_tests)
        
        # Calculate adjusted value
        total_cost = asking_price + repair_costs["total_average_cost"]
        
        # Generate recommendation
        recommendation = self._generate_recommendation(
            overall_score,
            asking_price,
            repair_costs,
            mot_tests
        )
        
        return {
            "overall_score": round(overall_score, 1),
            "recommendation": recommendation["category"],
            "message": recommendation["message"],
            "scores": {
                "mot_history": round(history_score, 1),
                "recent_failures": round(failure_score, 1),
                "dangerous_defects": round(danger_score, 1),
                "mileage_consistency": round(mileage_score, 1),
                "age_factor": round(age_score, 1)
            },
            "financial_analysis": {
                "asking_price": asking_price,
                "estimated_repairs": repair_costs["total_average_cost"],
                "estimated_repairs_min": repair_costs["total_min_cost"],
                "estimated_repairs_max": repair_costs["total_max_cost"],
                "total_estimated_cost": round(total_cost, 2),
                "repair_breakdown": repair_costs["breakdown"]
            },
            "mot_summary": {
                "total_tests": len(mot_tests),
                "recent_failures": self._count_recent_failures(mot_tests),
                "dangerous_defects_found": repair_costs["dangerous_items_count"],
                "last_mot_date": mot_tests[0].get("completedDate", "Unknown"),
                "last_mot_result": mot_tests[0].get("testResult", "Unknown")
            },
            "risk_factors": self._identify_risk_factors(mot_tests, repair_costs),
            "positive_factors": self._identify_positive_factors(mot_tests, overall_score)
        }
    
    def _calculate_history_score(self, mot_tests: List[Dict]) -> float:
        """Score based on overall MOT history (0-100)"""
        if len(mot_tests) < 2:
            return 50  # Neutral for insufficient history
        
        passes = sum(1 for test in mot_tests if test.get("testResult") == "PASSED")
        pass_rate = (passes / len(mot_tests)) * 100
        
        return pass_rate
    
    def _calculate_recent_failures_score(self, mot_tests: List[Dict]) -> float:
        """Score based on recent failures (0-100)"""
        recent_tests = mot_tests[:3]  # Last 3 tests
        
        if not recent_tests:
            return 50
        
        total_failures = 0
        for test in recent_tests:
            defects = test.get("defects", [])
            failures = [item for item in defects if item.get("type") in ["FAIL", "MAJOR", "DANGEROUS"]]
            total_failures += len(failures)
        
        # Score inversely proportional to failures
        if total_failures == 0:
            return 100
        elif total_failures <= 2:
            return 80
        elif total_failures <= 5:
            return 60
        elif total_failures <= 10:
            return 40
        else:
            return 20
    
    def _calculate_dangerous_defects_score(self, mot_tests: List[Dict]) -> float:
        """Score based on dangerous defects (0-100)"""
        dangerous_count = 0
        
        for test in mot_tests[:3]:  # Recent tests
            defects = test.get("defects", [])
            for item in defects:
                if item.get("dangerous", False) or item.get("type") == "DANGEROUS":
                    dangerous_count += 1
        
        if dangerous_count == 0:
            return 100
        elif dangerous_count == 1:
            return 70
        elif dangerous_count == 2:
            return 40
        else:
            return 10
    
    def _calculate_mileage_score(self, mot_tests: List[Dict]) -> float:
        """Score based on mileage consistency (0-100)"""
        mileages = []
        dates = []
        
        for test in mot_tests:
            if test.get("odometerValue") and test.get("completedDate"):
                mileages.append(test["odometerValue"])
                dates.append(test["completedDate"])
        
        if len(mileages) < 2:
            return 50  # Neutral
        
        # Check for inconsistencies
        for i in range(len(mileages) - 1):
            if mileages[i] < mileages[i + 1]:  # Mileage going backwards
                return 0
        
        # Check for reasonable annual mileage
        try:
            first_date = datetime.strptime(dates[-1], "%Y.%m.%d")
            last_date = datetime.strptime(dates[0], "%Y.%m.%d")
            years = (last_date - first_date).days / 365.25
            
            if years > 0:
                annual_mileage = (mileages[0] - mileages[-1]) / years
                
                if annual_mileage < 5000:
                    return 90  # Low mileage
                elif annual_mileage < 12000:
                    return 100  # Average
                elif annual_mileage < 20000:
                    return 70  # High
                else:
                    return 50  # Very high
        except:
            pass
        
        return 75  # Default good score
    
    def _calculate_age_score(self, mot_tests: List[Dict]) -> float:
        """Score based on vehicle age and test frequency (0-100)"""
        test_count = len(mot_tests)
        
        # More tests = older vehicle, but consistent testing is good
        if test_count <= 2:
            return 90  # Relatively new
        elif test_count <= 5:
            return 80
        elif test_count <= 10:
            return 70
        else:
            return 60  # Older vehicle
    
    def _estimate_immediate_repairs(self, mot_tests: List[Dict]) -> Dict:
        """Estimate costs for immediate repairs needed"""
        latest_test = mot_tests[0]
        defects = latest_test.get("defects", [])
        
        # Include failures, majors, dangerous items, and advisories for cost estimation
        immediate_issues = [
            item for item in defects
            if item.get("type") in ["FAIL", "MAJOR", "DANGEROUS", "ADVISORY", "MINOR"]
        ]
        
        return calculate_total_repair_costs(immediate_issues)
    
    def _count_recent_failures(self, mot_tests: List[Dict]) -> int:
        """Count failures in recent tests"""
        count = 0
        for test in mot_tests[:3]:
            if test.get("testResult") == "FAILED":
                count += 1
        return count
    
    def _identify_risk_factors(
        self,
        mot_tests: List[Dict],
        repair_costs: Dict
    ) -> List[str]:
        """Identify risk factors to buyer"""
        risks = []
        
        if repair_costs["dangerous_items_count"] > 0:
            risks.append(
                f"🚨 {repair_costs['dangerous_items_count']} dangerous defect(s) found"
            )
        
        if repair_costs["total_average_cost"] > 1000:
            risks.append(
                f"💰 High estimated repair costs (£{repair_costs['total_average_cost']:.2f})"
            )
        elif repair_costs["total_average_cost"] > 500:
            risks.append(
                f"💰 Moderate repair costs expected (£{repair_costs['total_average_cost']:.2f})"
            )
        
        if self._count_recent_failures(mot_tests) >= 2:
            risks.append("⚠️ Multiple recent MOT failures")
        
        # Check for specific issues
        latest_defects = mot_tests[0].get("defects", [])
        major_count = sum(1 for d in latest_defects if d.get("type") in ["MAJOR", "FAIL"])
        if major_count > 0:
            risks.append(f"⚠️ {major_count} major issue(s) in latest MOT")
        
        # Check for corrosion in recent tests
        for test in mot_tests[:2]:
            defects = test.get("defects", [])
            for item in defects:
                if "corrosion" in item.get("text", "").lower():
                    risks.append("🔧 Corrosion issues detected")
                    break
        
        if not risks:
            risks.append("✅ No major risk factors identified")
        
        return risks
    
    def _identify_positive_factors(
        self,
        mot_tests: List[Dict],
        overall_score: float
    ) -> List[str]:
        """Identify positive factors"""
        positives = []
        
        if overall_score >= 80:
            positives.append("⭐ Excellent overall condition score")
        
        recent_passes = sum(
            1 for test in mot_tests[:3]
            if test.get("testResult") == "PASSED"
        )
        
        if recent_passes >= 2:
            positives.append(f"✅ {recent_passes} recent MOT passes")
        
        # Check for clean recent tests
        latest_test = mot_tests[0]
        defects = latest_test.get("defects", [])
        advisory_count = sum(1 for d in defects if d.get("type") in ["ADVISORY", "MINOR"])
        
        if len(defects) == 0:
            positives.append("🎯 Latest MOT passed with no advisories")
        elif advisory_count > 0 and len(defects) == advisory_count:
            positives.append(f"✅ Latest MOT passed with only {advisory_count} minor advisory/advisories")
        
        if not positives:
            positives.append("Some positive factors found")
        
        return positives
    
    def _generate_recommendation(
        self,
        overall_score: float,
        asking_price: float,
        repair_costs: Dict,
        mot_tests: List[Dict]
    ) -> Dict[str, str]:
        """Generate purchase recommendation"""
        total_cost = asking_price + repair_costs["total_average_cost"]
        
        if overall_score >= 80 and repair_costs["total_average_cost"] < 500:
            return {
                "category": "highly_recommended",
                "message": f"Excellent choice! This vehicle shows strong MOT history with minimal repair needs. Total estimated cost: £{total_cost:.2f}"
            }
        elif overall_score >= 70 and repair_costs["total_average_cost"] < 1000:
            return {
                "category": "recommended",
                "message": f"Good option. Vehicle has decent history with manageable repair costs. Total estimated cost: £{total_cost:.2f}"
            }
        elif overall_score >= 60:
            return {
                "category": "acceptable_with_caution",
                "message": f"Acceptable but requires caution. Consider negotiating price down by £{repair_costs['total_average_cost']:.2f} for repairs. Total estimated cost: £{total_cost:.2f}"
            }
        elif overall_score >= 40:
            return {
                "category": "risky",
                "message": f"Risky purchase. Significant repairs needed (est. £{repair_costs['total_average_cost']:.2f}). Only proceed if price reflects condition. Total cost: £{total_cost:.2f}"
            }
        else:
            return {
                "category": "not_recommended",
                "message": f"Not recommended. Poor MOT history and high repair costs (est. £{repair_costs['total_average_cost']:.2f}). Total cost would be £{total_cost:.2f}"
            }
