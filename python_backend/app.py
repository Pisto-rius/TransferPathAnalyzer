#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import scipy
import pandas as pd
from sklearn.decomposition import TruncatedSVD
import json
import logging
import os
from pathlib import Path

# Set up logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Ensure data directory exists
DATA_DIR = Path("python_backend/data")
DATA_DIR.mkdir(exist_ok=True, parents=True)

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "Python backend is running"}), 200

@app.route('/compute-tpa', methods=['POST'])
def compute_tpa():
    """Compute Transfer Path Analysis based on provided parameters"""
    try:
        data = request.json
        logger.info(f"Received compute-tpa request with data: {data}")
        
        # Extract parameters from request
        frequency_band = data.get('frequencyBand', 'All Frequencies')
        target = data.get('target', "Driver's Ear")
        frf_dataset_id = data.get('frfDatasetId')
        operational_measurement_id = data.get('operationalMeasurementId')
        
        # Perform TPA computation
        # In a real implementation, we would load the actual FRF and operational data
        # For now, we'll generate synthetic data for demonstration
        result = perform_tpa_computation(frequency_band, target, frf_dataset_id, operational_measurement_id)
        
        return jsonify(result), 200
    
    except Exception as e:
        logger.error(f"Error in compute-tpa: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/compute-svd', methods=['POST'])
def compute_svd():
    """Compute Singular Value Decomposition for transfer function matrix"""
    try:
        data = request.json
        logger.info(f"Received compute-svd request with data: {data}")
        
        # Extract matrix from request
        matrix = np.array(data.get('matrix', []))
        
        if matrix.size == 0:
            return jsonify({"error": "Empty matrix provided"}), 400
        
        # Perform SVD
        result = perform_svd_analysis(matrix)
        
        return jsonify(result), 200
    
    except Exception as e:
        logger.error(f"Error in compute-svd: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

def perform_tpa_computation(frequency_band, target, frf_dataset_id=None, operational_measurement_id=None):
    """
    Perform Transfer Path Analysis computation
    
    Args:
        frequency_band (str): Frequency band for analysis
        target (str): Target location for analysis
        frf_dataset_id (int, optional): ID of FRF dataset
        operational_measurement_id (int, optional): ID of operational measurement
    
    Returns:
        dict: TPA computation results
    """
    logger.info(f"Performing TPA computation for band {frequency_band} and target {target}")
    
    # Create a transfer function matrix (H)
    # This would normally be loaded from actual measurements
    # For demo, we'll create a synthetic matrix
    paths = ["Engine Mount 1", "Engine Mount 2", "Exhaust Hanger", 
             "Subframe", "Transmission Mount", "Suspension", "Air Intake", "Other"]
    frequencies = ["125Hz", "250Hz", "500Hz", "1kHz", "2kHz", "4kHz", "8kHz"]
    
    # Create a synthetic transfer function matrix with realistic values
    H = create_synthetic_transfer_function(paths, frequencies)
    
    # Create synthetic operational forces (F)
    F = create_synthetic_operational_forces(paths, frequencies)
    
    # Compute response Y = H * F
    Y = compute_system_response(H, F)
    
    # Compute source contributions
    source_contributions = compute_source_contributions(H, F)
    
    # Perform SVD analysis on the transfer matrix
    svd_analysis = perform_svd_analysis(H.reshape(len(paths), len(frequencies)))
    
    # Compute prediction accuracy
    prediction_accuracy = compute_prediction_accuracy(H, F, Y)
    
    # Compute KPIs
    kpis = compute_kpis(H, F, Y)
    
    # Format transfer functions for output
    transfer_functions = format_transfer_functions(H, paths, frequencies)
    
    # Create the result object
    result = {
        "frequencyBand": frequency_band,
        "target": target,
        "kpis": kpis,
        "contributionData": source_contributions,
        "svdAnalysis": svd_analysis,
        "transferFunctions": transfer_functions,
        "predictionAccuracy": prediction_accuracy
    }
    
    return result

def create_synthetic_transfer_function(paths, frequencies):
    """
    Create a synthetic transfer function matrix for demonstration
    
    In real implementation, this would be loaded from measurements
    """
    np.random.seed(42)  # For reproducibility
    
    # Create a 3D matrix: paths x frequencies
    H = np.zeros((len(paths), len(frequencies)))
    
    # Generate realistic values for each path and frequency
    for i, path in enumerate(paths):
        # Different paths have different frequency responses
        if "Engine" in path:
            # Engine mounts have higher response in low frequencies
            peak_freq = 1
            H[i, :] = 0.8 * np.exp(-0.5 * ((np.arange(len(frequencies)) - peak_freq) / 1.5) ** 2)
        elif "Exhaust" in path:
            # Exhaust has mid-frequency response
            peak_freq = 3
            H[i, :] = 0.6 * np.exp(-0.5 * ((np.arange(len(frequencies)) - peak_freq) / 2) ** 2)
        elif "Suspension" in path:
            # Suspension has broad frequency response
            H[i, :] = 0.5 * (np.sin(np.arange(len(frequencies)) / 2) + 1) / 2
        else:
            # Other paths have random response patterns
            H[i, :] = 0.4 * np.random.rand(len(frequencies))
    
    # Add some noise
    H += 0.05 * np.random.randn(len(paths), len(frequencies))
    
    # Ensure positive values and scale to a realistic range (0 to 1)
    H = np.abs(H)
    
    return H

def create_synthetic_operational_forces(paths, frequencies):
    """
    Create synthetic operational forces
    
    In real implementation, this would be measured data
    """
    np.random.seed(43)  # Different seed from H
    
    # Create a matrix: paths x frequencies
    F = np.zeros((len(paths), len(frequencies)))
    
    # Generate realistic values for each source and frequency
    for i, path in enumerate(paths):
        if "Engine" in path:
            # Engine has higher forces at specific frequencies
            peak_freq = 2
            base = 0.9 * np.exp(-0.5 * ((np.arange(len(frequencies)) - peak_freq) / 1) ** 2)
            # Add engine order harmonics
            harmonics = 0.3 * np.exp(-0.5 * ((np.arange(len(frequencies)) - 2*peak_freq) / 0.5) ** 2)
            F[i, :] = base + harmonics
        elif "Transmission" in path:
            # Transmission has mid to high frequency content
            F[i, :] = 0.7 * np.exp(-0.5 * ((np.arange(len(frequencies)) - 4) / 2) ** 2)
        elif "Air Intake" in path:
            # Air intake has high frequency content
            F[i, :] = 0.5 * np.exp(-0.5 * ((np.arange(len(frequencies)) - 5) / 1) ** 2)
        else:
            # Other sources have lower broadband contributions
            F[i, :] = 0.3 * np.random.rand(len(frequencies))
    
    # Add some noise
    F += 0.05 * np.random.randn(len(paths), len(frequencies))
    
    # Ensure positive values
    F = np.abs(F)
    
    return F

def compute_system_response(H, F):
    """
    Compute system response Y = H * F
    """
    # In real TPA, this would be a proper matrix multiplication
    # For our simplified model, we'll use element-wise multiplication and sum
    Y = np.sum(H * F, axis=0)
    return Y

def compute_source_contributions(H, F):
    """
    Compute individual source contributions to the total response
    """
    # Calculate source contributions as percentage of total response
    source_contributions = []
    
    # Calculate individual contributions (H*F for each path)
    individual_contributions = H * F
    
    # Sum across frequencies to get overall contribution per path
    path_totals = np.sum(individual_contributions, axis=1)
    
    # Convert to percentages
    total = np.sum(path_totals)
    if total > 0:
        percentages = path_totals / total
    else:
        percentages = np.zeros_like(path_totals)
    
    # Source colors for visualization
    colors = {
        "Engine Mount 1": "#FF5733",
        "Engine Mount 2": "#FF8C33",
        "Exhaust Hanger": "#33FF57",
        "Subframe": "#33FFC4",
        "Transmission Mount": "#3357FF",
        "Suspension": "#C433FF",
        "Air Intake": "#FF33A8",
        "Other": "#808080"
    }
    
    # Create source contribution objects
    paths = ["Engine Mount 1", "Engine Mount 2", "Exhaust Hanger", 
             "Subframe", "Transmission Mount", "Suspension", "Air Intake", "Other"]
    
    for i, path in enumerate(paths):
        contribution = {
            "name": path,
            "value": float(percentages[i] * 100),  # Convert to percentage
            "color": colors.get(path, "#000000")
        }
        source_contributions.append(contribution)
    
    # Sort by value descending
    source_contributions.sort(key=lambda x: x["value"], reverse=True)
    
    return source_contributions

def perform_svd_analysis(matrix):
    """
    Perform Singular Value Decomposition analysis on a matrix
    
    Args:
        matrix: numpy array representing the matrix to analyze
    
    Returns:
        dict: SVD analysis results
    """
    # Perform SVD
    U, s, Vt = scipy.linalg.svd(matrix, full_matrices=False)
    
    # Compute condition number
    condition_number = float(s[0] / s[-1]) if s[-1] > 0 else float('inf')
    
    # Determine quality of matrix inversion
    inversion_quality = "Good" if condition_number < 1000 else "Poor"
    
    # Determine truncation level (95% energy)
    total_energy = np.sum(s**2)
    cumulative_energy = np.cumsum(s**2) / total_energy
    truncation_level = np.searchsorted(cumulative_energy, 0.95) + 1
    
    return {
        "singularValues": s.tolist(),
        "truncationLevel": int(truncation_level),
        "singularValuesUsed": int(truncation_level),
        "conditionNumber": float(condition_number),
        "inversionQuality": inversion_quality
    }

def compute_prediction_accuracy(H, F, Y):
    """
    Compute prediction accuracy by comparing calculated response to a synthetic "measured" response
    """
    # In a real implementation, we would compare to actual measurements
    # For demo, we'll add synthetic "measurement error"
    np.random.seed(44)
    
    # Create synthetic "measured" response with some deviation from calculated
    Y_measured = Y + 0.1 * np.random.randn(len(Y))
    
    # Ensure positive values
    Y_measured = np.abs(Y_measured)
    
    # Calculate error percentages per frequency band
    errors = np.abs(Y - Y_measured) / np.maximum(Y_measured, 1e-10) * 100
    
    # Calculate overall accuracy (100 - average error %)
    overall_accuracy = 100 - float(np.mean(errors))
    
    # Calculate accuracy for different frequency ranges
    low_freq_idx = [0, 1]  # 125Hz, 250Hz
    mid_freq_idx = [2, 3, 4]  # 500Hz, 1kHz, 2kHz
    high_freq_idx = [5, 6]  # 4kHz, 8kHz
    
    low_freq_accuracy = 100 - float(np.mean(errors[low_freq_idx]))
    mid_freq_accuracy = 100 - float(np.mean(errors[mid_freq_idx]))
    high_freq_accuracy = 100 - float(np.mean(errors[high_freq_idx]))
    
    # Create error distribution
    frequencies = ["125Hz", "250Hz", "500Hz", "1kHz", "2kHz", "4kHz", "8kHz"]
    error_distribution = [
        {"frequency": freq, "error": float(error)} 
        for freq, error in zip(frequencies, errors)
    ]
    
    return {
        "overall": overall_accuracy,
        "lowFrequency": low_freq_accuracy,
        "midFrequency": mid_freq_accuracy,
        "highFrequency": high_freq_accuracy,
        "errorDistribution": error_distribution
    }

def compute_kpis(H, F, Y):
    """
    Compute Key Performance Indicators from TPA results
    """
    # Overall Sound Pressure Level (dB)
    # In real implementation, this would be computed from actual sound pressure
    # For demo, we'll use the sum of the response as a proxy
    sound_pressure_level = 70 + 10 * np.log10(np.sum(Y**2))
    
    # Maximum vibration amplitude
    # In real implementation, this would be from acceleration measurements
    max_vibration_amplitude = 2.5 * np.max(Y)
    
    # Dominant frequency (Hz)
    frequencies = [125, 250, 500, 1000, 2000, 4000, 8000]
    dominant_freq_idx = np.argmax(Y)
    dominant_frequency = frequencies[dominant_freq_idx]
    
    # Transfer efficiency (%)
    # Ratio of output energy to input energy
    input_energy = np.sum(F**2)
    output_energy = np.sum(Y**2)
    transfer_efficiency = min(100.0, 100.0 * output_energy / input_energy if input_energy > 0 else 0)
    
    return {
        "soundPressureLevel": float(sound_pressure_level),
        "maxVibrationAmplitude": float(max_vibration_amplitude),
        "dominantFrequency": float(dominant_frequency),
        "transferEfficiency": float(transfer_efficiency)
    }

def format_transfer_functions(H, paths, frequencies):
    """
    Format transfer functions for output
    """
    transfer_functions = {}
    
    for i, path in enumerate(paths):
        transfer_functions[path] = {}
        for j, freq in enumerate(frequencies):
            transfer_functions[path][freq] = float(H[i, j])
    
    return transfer_functions

if __name__ == '__main__':
    port = int(os.environ.get('PYTHON_PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)