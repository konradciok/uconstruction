#!/usr/bin/env python3
"""
Script to run Portfolio 2 module tests with verbose output.
"""

import subprocess
import sys
import os

def run_tests():
    """Run Portfolio 2 tests with verbose output."""
    try:
        # Change to the project directory
        project_dir = os.path.dirname(os.path.abspath(__file__))
        os.chdir(project_dir)
        
        # Run the tests for Portfolio 2 components
        cmd = [
            "npm", "test", 
            "--", 
            "--testPathPattern=Portfolio2",
            "--verbose",
            "--watchAll=false"
        ]
        
        print("Running Portfolio 2 tests...")
        print(f"Command: {' '.join(cmd)}")
        print("-" * 50)
        
        result = subprocess.run(cmd, capture_output=False, text=True)
        
        if result.returncode == 0:
            print("\n✅ All Portfolio 2 tests passed!")
        else:
            print(f"\n❌ Some Portfolio 2 tests failed with exit code: {result.returncode}")
            sys.exit(1)
            
    except FileNotFoundError:
        print("❌ Error: npm not found. Make sure Node.js and npm are installed.")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error running tests: {e}")
        sys.exit(1)

if __name__ == "__main__":
    run_tests()
