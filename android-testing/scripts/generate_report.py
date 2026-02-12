#!/usr/bin/env python3

"""
Consolidated Report Generator for Google Play Console

This script consolidates multiple test reports from different devices and test runs
into a single comprehensive report suitable for Google Play Console submission.
"""

import os
import sys
import json
import csv
import glob
from datetime import datetime
from collections import defaultdict
from typing import List, Dict, Any

class ReportGenerator:
    def __init__(self, reports_dir: str):
        self.reports_dir = reports_dir
        self.all_results = []
        self.device_stats = defaultdict(lambda: {'passed': 0, 'failed': 0, 'total': 0})
        self.daily_stats = defaultdict(lambda: {'passed': 0, 'failed': 0, 'total': 0})
        
    def collect_reports(self):
        """Collect all JSON reports from the reports directory"""
        print(f"Collecting reports from: {self.reports_dir}")
        
        # Find all JSON report files
        pattern = os.path.join(self.reports_dir, "**/report_*.json")
        report_files = glob.glob(pattern, recursive=True)
        
        print(f"Found {len(report_files)} report files")
        
        for report_file in report_files:
            try:
                with open(report_file, 'r') as f:
                    report_data = json.load(f)
                    self.process_report(report_data)
            except Exception as e:
                print(f"Error processing {report_file}: {e}")
                
    def process_report(self, report: Dict[str, Any]):
        """Process a single report and update statistics"""
        device_key = f"{report.get('device', {}).get('manufacturer', 'Unknown')} {report.get('device', {}).get('model', 'Unknown')}"
        
        for result in report.get('results', []):
            # Add to all results
            self.all_results.append({
                'testName': result.get('testName'),
                'status': result.get('status'),
                'startTime': result.get('startTime'),
                'duration': result.get('duration'),
                'device': device_key,
                'androidVersion': report.get('device', {}).get('androidVersion', 'Unknown'),
                'message': result.get('message', '')
            })
            
            # Update device statistics
            self.device_stats[device_key]['total'] += 1
            if result.get('status') == 'PASS':
                self.device_stats[device_key]['passed'] += 1
            elif result.get('status') == 'FAIL':
                self.device_stats[device_key]['failed'] += 1
                
            # Update daily statistics
            test_date = result.get('startTime', '')[:10]  # Extract date
            self.daily_stats[test_date]['total'] += 1
            if result.get('status') == 'PASS':
                self.daily_stats[test_date]['passed'] += 1
            elif result.get('status') == 'FAIL':
                self.daily_stats[test_date]['failed'] += 1
                
    def generate_json_report(self, output_file: str):
        """Generate consolidated JSON report"""
        total_tests = len(self.all_results)
        passed_tests = sum(1 for r in self.all_results if r['status'] == 'PASS')
        failed_tests = sum(1 for r in self.all_results if r['status'] == 'FAIL')
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        consolidated_report = {
            'reportType': 'Google Play Console Testing Report',
            'generatedAt': datetime.now().isoformat(),
            'summary': {
                'totalTests': total_tests,
                'passed': passed_tests,
                'failed': failed_tests,
                'successRate': round(success_rate, 2),
                'testingPeriod': {
                    'start': min(r['startTime'] for r in self.all_results) if self.all_results else None,
                    'end': max(r['startTime'] for r in self.all_results) if self.all_results else None
                }
            },
            'deviceCoverage': {
                device: {
                    'totalTests': stats['total'],
                    'passed': stats['passed'],
                    'failed': stats['failed'],
                    'successRate': round((stats['passed'] / stats['total'] * 100) if stats['total'] > 0 else 0, 2)
                }
                for device, stats in self.device_stats.items()
            },
            'dailyStats': {
                date: {
                    'totalTests': stats['total'],
                    'passed': stats['passed'],
                    'failed': stats['failed'],
                    'successRate': round((stats['passed'] / stats['total'] * 100) if stats['total'] > 0 else 0, 2)
                }
                for date, stats in sorted(self.daily_stats.items())
            },
            'detailedResults': self.all_results
        }
        
        with open(output_file, 'w') as f:
            json.dump(consolidated_report, f, indent=2)
            
        print(f"JSON report generated: {output_file}")
        return consolidated_report
        
    def generate_csv_report(self, output_file: str):
        """Generate consolidated CSV report for Google Play Console"""
        csv_file = output_file.replace('.json', '.csv')
        
        with open(csv_file, 'w', newline='') as f:
            writer = csv.writer(f)
            
            # Write header
            writer.writerow([
                'Test Name',
                'Status',
                'Start Time',
                'Duration (ms)',
                'Device',
                'Android Version',
                'Message'
            ])
            
            # Write data
            for result in self.all_results:
                writer.writerow([
                    result.get('testName', ''),
                    result.get('status', ''),
                    result.get('startTime', ''),
                    result.get('duration', ''),
                    result.get('device', ''),
                    result.get('androidVersion', ''),
                    result.get('message', '')
                ])
                
        print(f"CSV report generated: {csv_file}")
        
    def print_summary(self):
        """Print summary to console"""
        total_tests = len(self.all_results)
        passed_tests = sum(1 for r in self.all_results if r['status'] == 'PASS')
        failed_tests = sum(1 for r in self.all_results if r['status'] == 'FAIL')
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        print("\n" + "="*60)
        print("CONSOLIDATED TEST REPORT SUMMARY")
        print("="*60)
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {success_rate:.2f}%")
        print("\nDevice Coverage:")
        for device, stats in self.device_stats.items():
            success = (stats['passed'] / stats['total'] * 100) if stats['total'] > 0 else 0
            print(f"  {device}: {stats['total']} tests, {success:.2f}% success")
        print("="*60 + "\n")

def main():
    if len(sys.argv) < 3:
        print("Usage: python3 generate_report.py <reports_directory> <output_file>")
        sys.exit(1)
        
    reports_dir = sys.argv[1]
    output_file = sys.argv[2]
    
    if not os.path.exists(reports_dir):
        print(f"Error: Reports directory not found: {reports_dir}")
        sys.exit(1)
        
    generator = ReportGenerator(reports_dir)
    generator.collect_reports()
    generator.generate_json_report(output_file)
    generator.generate_csv_report(output_file)
    generator.print_summary()
    
    print(f"\n✅ Consolidated reports ready for Google Play Console submission:")
    print(f"   - JSON: {output_file}")
    print(f"   - CSV: {output_file.replace('.json', '.csv')}")

if __name__ == '__main__':
    main()
