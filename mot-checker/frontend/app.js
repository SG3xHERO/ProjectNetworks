// MOT Checker Application
// Configuration
const CONFIG = {
  apiUrl: window.location.hostname === 'localhost' 
    ? 'http://localhost:8084' 
    : 'https://api.projectnetworks.co.uk',
  apiKey: 'your-api-key-here' // This should be set via environment/config
};

// DOM Elements
const motForm = document.getElementById('mot-form');
const valuationForm = document.getElementById('valuation-form');
const resultsSection = document.getElementById('results');
const resultsContent = document.getElementById('results-content');
const tabBtns = document.querySelectorAll('.tab-btn');
const preloader = document.getElementById('js-preloader');
const backToTopBtn = document.getElementById('backToTop');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initTabs();
  initForms();
  initBackToTop();
  initMobileMenu();
});

// Preloader
function initPreloader() {
  setTimeout(() => {
    preloader.classList.add('loaded');
  }, 1000);
}

// Tab System
function initTabs() {
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
      
      // Update buttons
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Update content
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      document.getElementById(tabName).classList.add('active');
    });
  });
}

// Forms
function initForms() {
  motForm.addEventListener('submit', handleMotLookup);
  valuationForm.addEventListener('submit', handleValuation);
}

// MOT Lookup Handler
async function handleMotLookup(e) {
  e.preventDefault();
  
  const registration = document.getElementById('registration').value.trim().toUpperCase();
  const submitBtn = motForm.querySelector('button[type="submit"]');
  
  setLoading(submitBtn, true);
  hideResults();
  
  try {
    const response = await fetch(`${CONFIG.apiUrl}/api/mot/lookup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ registration })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch MOT data');
    }
    
    const data = await response.json();
    displayMotResults(data);
    
  } catch (error) {
    showError(error.message);
  } finally {
    setLoading(submitBtn, false);
  }
}

// Valuation Handler
async function handleValuation(e) {
  e.preventDefault();
  
  const registration = document.getElementById('valuation-registration').value.trim().toUpperCase();
  const askingPrice = parseFloat(document.getElementById('asking-price').value);
  const submitBtn = valuationForm.querySelector('button[type="submit"]');
  
  setLoading(submitBtn, true);
  hideResults();
  
  try {
    const response = await fetch(`${CONFIG.apiUrl}/api/mot/valuation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        registration,
        asking_price: askingPrice
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to calculate valuation');
    }
    
    const data = await response.json();
    displayValuationResults(data);
    
  } catch (error) {
    showError(error.message);
  } finally {
    setLoading(submitBtn, false);
  }
}

// Display MOT Results
function displayMotResults(data) {
  const motData = data.data;
  const motTests = motData.motTests || [];
  
  if (motTests.length === 0) {
    showError('No MOT history found for this vehicle');
    return;
  }
  
  const latestTest = motTests[0];
  const testResult = latestTest.testResult;
  
  // Debug: Log the RFR items to console
  console.log('Latest test RFR items:', latestTest.rfrAndComments);
  if (latestTest.rfrAndComments && latestTest.rfrAndComments.length > 0) {
    console.log('Sample item:', latestTest.rfrAndComments[0]);
  }
  
  let html = `
    <div class="result-card">
      <div class="result-header">
        <div>
          <h2 class="result-registration">${data.registration}</h2>
          ${motData.make || motData.model ? `
            <p class="vehicle-info">
              ${[motData.make, motData.model].filter(Boolean).join(' ')}
              ${motData.primaryColour ? `<span class="vehicle-color"> • ${motData.primaryColour}</span>` : ''}
            </p>
          ` : ''}
        </div>
        <span class="result-badge ${getResultBadgeClass(testResult)}">
          ${testResult}
        </span>
      </div>
      
      <div class="mot-summary">
        <h3>Latest MOT Test</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Test Date</span>
            <span class="info-value">${formatDate(latestTest.completedDate)}</span>
          </div>
          ${latestTest.expiryDate ? `
            <div class="info-item">
              <span class="info-label">Expiry Date</span>
              <span class="info-value">${formatDate(latestTest.expiryDate)}</span>
            </div>
          ` : ''}
          ${latestTest.odometerValue ? `
            <div class="info-item">
              <span class="info-label">Mileage</span>
              <span class="info-value">${latestTest.odometerValue.toLocaleString()} ${latestTest.odometerUnit}</span>
            </div>
          ` : ''}
          <div class="info-item">
            <span class="info-label">Total Tests</span>
            <span class="info-value">${motTests.length}</span>
          </div>
        </div>
      </div>
      
      ${displayRFRItems(latestTest.rfrAndComments)}
      ${displayTestHistory(motTests)}
    </div>
  `;
  
  resultsContent.innerHTML = html;
  showResults();
}

// Display Valuation Results
function displayValuationResults(data) {
  const valuation = data.valuation;
  const recommendation = getRecommendationDetails(valuation.recommendation);
  
  // Safely access financial analysis data
  const financial = valuation.financial_analysis || {};
  const askingPrice = financial.asking_price || 0;
  const estimatedRepairs = financial.estimated_repairs || 0;
  const totalCost = financial.total_estimated_cost || askingPrice;
  const repairsMin = financial.estimated_repairs_min || 0;
  const repairsMax = financial.estimated_repairs_max || 0;
  
  let html = `
    <div class="result-card">
      <div class="result-header">
        <div>
          <h2 class="result-registration">${data.registration}</h2>
          ${data.data?.make || data.data?.model ? `
            <p class="vehicle-info">
              ${[data.data.make, data.data.model].filter(Boolean).join(' ')}
              ${data.data.primaryColour ? `<span class="vehicle-color"> • ${data.data.primaryColour}</span>` : ''}
            </p>
          ` : ''}
        </div>
        <span class="result-badge ${recommendation.class}">
          ${recommendation.label}
        </span>
      </div>
      
      <div class="valuation-summary">
        <div class="score-circle">
          <svg viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="12"/>
            <circle 
              cx="100" 
              cy="100" 
              r="90" 
              fill="none" 
              stroke="url(#gradient)" 
              stroke-width="12"
              stroke-dasharray="${valuation.overall_score * 5.65} 565"
              stroke-linecap="round"
              transform="rotate(-90 100 100)"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:#db01f9;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#0071f8;stop-opacity:1" />
              </linearGradient>
            </defs>
          </svg>
          <div class="score-value">
            <span class="score-number">${valuation.overall_score}</span>
            <span class="score-label">/100</span>
          </div>
        </div>
        
        <div class="valuation-message">
          <h3>${recommendation.label}</h3>
          <p>${valuation.message}</p>
        </div>
      </div>
      
      <div class="financial-breakdown">
        <h3>Financial Analysis</h3>
        <div class="finance-grid">
          <div class="finance-item">
            <span class="finance-label">Asking Price</span>
            <span class="finance-value">£${askingPrice.toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
          </div>
          <div class="finance-item">
            <span class="finance-label">Est. Repairs</span>
            <span class="finance-value">£${estimatedRepairs.toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
          </div>
          <div class="finance-item">
            <span class="finance-label">Total Cost</span>
            <span class="finance-value highlight">£${totalCost.toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
          </div>
        </div>
        <p class="finance-note">Repair estimates: £${repairsMin.toLocaleString('en-GB')} - £${repairsMax.toLocaleString('en-GB')}</p>
      </div>
      
      ${displayFactors('Risk Factors', valuation.risk_factors || [], 'warning')}
      ${displayFactors('Positive Factors', valuation.positive_factors || [], 'success')}
      ${displayScoreBreakdown(valuation.scores)}
      
      <div class="disclaimer-box">
        <strong>⚠️ Important:</strong> This is an automated assessment based on MOT history. Always get a professional inspection before purchasing. Repair costs are estimates and may vary. Last updated: ${data.last_updated}
      </div>
    </div>
  `;
  
  resultsContent.innerHTML = html;
  showResults();
}

// Helper: Display RFR Items
function displayRFRItems(items) {
  if (!items || items.length === 0) {
    return '';
  }
  
  const failures = items.filter(item => item.type === 'FAIL' || item.type === 'PRS' || item.type === 'MAJOR' || item.type === 'DANGEROUS');
  const advisories = items.filter(item => item.type === 'ADVISORY' || item.type === 'USER ENTERED' || item.type === 'MINOR');
  
  // If no failures or advisories after filtering, don't show anything
  if (failures.length === 0 && advisories.length === 0) {
    return '<div class="no-issues">✅ No advisories or failures recorded</div>';
  }
  
  let html = '<div class="rfr-section">';
  
  if (failures.length > 0) {
    html += '<h3>Failures</h3><ul class="rfr-list failures">';
    failures.forEach(item => {
      html += `
        <li class="${item.dangerous ? 'dangerous' : ''}">
          ${item.dangerous ? '🚨' : '❌'} ${escapeHtml(item.text)}
        </li>
      `;
    });
    html += '</ul>';
  }
  
  if (advisories.length > 0) {
    html += '<h3>Advisories</h3><ul class="rfr-list advisories">';
    advisories.forEach(item => {
      html += `<li>⚠️ ${escapeHtml(item.text)}</li>`;
    });
    html += '</ul>';
  }
  
  html += '</div>';
  return html;
}

// Helper: Display Test History
function displayTestHistory(tests) {
  let html = `
    <div class="test-history">
      <h3>MOT History</h3>
      <div class="history-timeline">
  `;
  
  tests.forEach((test, index) => {
    const hasIssues = test.rfrAndComments && test.rfrAndComments.length > 0;
    const testId = `test-${index}`;
    
    html += `
      <div class="timeline-item">
        <div class="timeline-marker ${test.testResult === 'PASSED' ? 'pass' : 'fail'}"></div>
        <div class="timeline-content">
          <div class="timeline-header" onclick="toggleTestDetails('${testId}')" style="cursor: pointer;">
            <div>
              <span class="timeline-date">${formatDate(test.completedDate)}</span>
              ${test.odometerValue ? `<span class="timeline-mileage"> • ${test.odometerValue.toLocaleString()} miles</span>` : ''}
            </div>
            <div>
              <span class="timeline-result ${test.testResult === 'PASSED' ? 'pass' : 'fail'}">${test.testResult}</span>
              ${hasIssues ? '<span class="expand-icon">▼</span>' : ''}
            </div>
          </div>
          ${hasIssues ? `
            <div id="${testId}" class="timeline-details" style="display: none;">
              ${displayRFRItems(test.rfrAndComments)}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  });
  
  html += '</div></div>';
  return html;
}

// Helper: Display Factors
function displayFactors(title, factors, type) {
  if (!factors || factors.length === 0) {
    return '';
  }
  
  return `
    <div class="factors-section ${type}">
      <h3>${title}</h3>
      <ul class="factors-list">
        ${factors.map(factor => `<li>${escapeHtml(factor)}</li>`).join('')}
      </ul>
    </div>
  `;
}

// Helper: Display Score Breakdown
function displayScoreBreakdown(scores) {
  if (!scores || Object.keys(scores).length === 0) {
    return '';
  }
  
  return `
    <div class="score-breakdown">
      <h3>Score Breakdown</h3>
      <div class="scores-grid">
        ${Object.entries(scores).map(([key, value]) => {
          const numValue = typeof value === 'number' ? value : 0;
          return `
            <div class="score-item">
              <span class="score-label">${formatScoreLabel(key)}</span>
              <div class="score-bar">
                <div class="score-fill" style="width: ${numValue}%"></div>
              </div>
              <span class="score-value">${numValue}</span>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// Utility Functions
function setLoading(button, loading) {
  if (loading) {
    button.disabled = true;
    button.dataset.originalText = button.innerHTML;
    button.innerHTML = '<span class="loading-spinner"></span> Loading...';
  } else {
    button.disabled = false;
    button.innerHTML = button.dataset.originalText;
  }
}

function showResults() {
  resultsSection.style.display = 'block';
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function hideResults() {
  resultsSection.style.display = 'none';
}

function showError(message) {
  resultsContent.innerHTML = `
    <div class="error-card">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <h3>Error</h3>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
  showResults();
}

function getResultBadgeClass(result) {
  if (result === 'PASSED') return 'success';
  if (result === 'FAILED') return 'danger';
  return 'warning';
}

function getRecommendationDetails(recommendation) {
  const details = {
    'highly_recommended': { label: 'Highly Recommended', class: 'success' },
    'recommended': { label: 'Recommended', class: 'success' },
    'acceptable_with_caution': { label: 'Acceptable with Caution', class: 'warning' },
    'risky': { label: 'Risky Purchase', class: 'warning' },
    'not_recommended': { label: 'Not Recommended', class: 'danger' },
    'insufficient_data': { label: 'Insufficient Data', class: 'warning' }
  };
  
  return details[recommendation] || details['insufficient_data'];
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  
  // Handle ISO format (YYYY-MM-DD)
  if (dateString.includes('-')) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  
  // Handle dot format (YYYY.MM.DD)
  const parts = dateString.split('.');
  if (parts.length === 3) {
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  
  return dateString;
}

function formatScoreLabel(key) {
  return key.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Back to Top
function initBackToTop() {
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  });
  
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Mobile Menu
function initMobileMenu() {
  const toggle = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }
}

// Toggle test details
function toggleTestDetails(testId) {
  const details = document.getElementById(testId);
  const icon = details.previousElementSibling.querySelector('.expand-icon');
  
  if (details.style.display === 'none') {
    details.style.display = 'block';
    if (icon) icon.style.transform = 'rotate(180deg)';
  } else {
    details.style.display = 'none';
    if (icon) icon.style.transform = 'rotate(0deg)';
  }
}

// Make toggleTestDetails available globally
window.toggleTestDetails = toggleTestDetails;

// Additional Styles for Dynamic Content
const style = document.createElement('style');
style.textContent = `
  .result-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--space-6);
    gap: var(--space-4);
  }
  
  .vehicle-info {
    font-size: var(--font-size-md);
    color: var(--color-text-subtle);
    margin-top: var(--space-2);
    font-weight: 500;
  }
  
  .vehicle-color {
    text-transform: capitalize;
  }
  
  .info-grid, .finance-grid, .scores-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-4);
    margin-top: var(--space-4);
  }
  
  .info-item, .finance-item {
    background: rgba(255, 255, 255, 0.03);
    padding: var(--space-4);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
  }
  
  .info-label, .finance-label {
    display: block;
    font-size: var(--font-size-sm);
    color: var(--color-text-subtle);
    margin-bottom: var(--space-2);
  }
  
  .info-value, .finance-value {
    display: block;
    font-size: var(--font-size-lg);
    font-weight: 700;
  }
  
  .finance-value.highlight {
    color: var(--color-primary);
  }
  
  .rfr-section, .test-history, .factors-section, .score-breakdown, .financial-breakdown {
    margin-top: var(--space-6);
  }
  
  .rfr-section h3, .test-history h3, .factors-section h3, .score-breakdown h3, .financial-breakdown h3 {
    font-size: var(--font-size-lg);
    margin-bottom: var(--space-4);
  }
  
  .rfr-list, .factors-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }
  
  .rfr-list li {
    padding: var(--space-3);
    background: rgba(255, 255, 255, 0.03);
    border-radius: var(--radius-md);
    border-left: 3px solid var(--color-accent);
  }
  
  .rfr-list.failures li {
    border-left-color: #ef4444;
  }
  
  .rfr-list li.dangerous {
    background: rgba(239, 68, 68, 0.1);
    border-left-color: #dc2626;
  }
  
  .timeline-item {
    display: flex;
    gap: var(--space-4);
    margin-bottom: var(--space-4);
    padding-bottom: var(--space-4);
    border-bottom: 1px solid var(--color-border);
  }
  
  .timeline-marker {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    margin-top: 5px;
    flex-shrink: 0;
  }
  
  .timeline-marker.pass {
    background: #22c55e;
  }
  
  .timeline-marker.fail {
    background: #ef4444;
  }
  
  .timeline-content {
    flex: 1;
  }
  
  .timeline-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-2);
    padding: var(--space-2);
    border-radius: var(--radius-sm);
    transition: background 0.2s ease;
  }
  
  .timeline-header:hover {
    background: rgba(255, 255, 255, 0.03);
  }
  
  .timeline-mileage {
    color: var(--color-text-subtle);
    font-size: var(--font-size-sm);
  }
  
  .expand-icon {
    display: inline-block;
    margin-left: var(--space-2);
    transition: transform 0.3s ease;
    font-size: 0.8em;
  }
  
  .timeline-details {
    margin-top: var(--space-3);
    padding-top: var(--space-3);
    border-top: 1px solid var(--color-border);
  }
  
  .timeline-details .rfr-section {
    margin-top: 0;
  }
  
  .timeline-details h3 {
    font-size: var(--font-size-md);
    margin-bottom: var(--space-3);
  }
  
  .timeline-result.pass {
    color: #22c55e;
  }
  
  .timeline-result.fail {
    color: #ef4444;
  }
  
  .score-circle {
    position: relative;
    width: 200px;
    height: 200px;
    margin: 0 auto var(--space-6);
  }
  
  .score-circle svg {
    width: 100%;
    height: 100%;
  }
  
  .score-value {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
  }
  
  .score-number {
    display: block;
    font-size: var(--font-size-4xl);
    font-weight: 800;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .score-label {
    font-size: var(--font-size-md);
    color: var(--color-text-subtle);
  }
  
  .score-item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }
  
  .score-bar {
    flex: 1;
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-full);
    overflow: hidden;
  }
  
  .score-fill {
    height: 100%;
    background: var(--gradient-primary);
    border-radius: var(--radius-full);
    transition: width 1s ease;
  }
  
  .error-card {
    text-align: center;
    padding: var(--space-9);
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: var(--radius-xl);
  }
  
  .error-card svg {
    color: #ef4444;
    margin: 0 auto var(--space-4);
  }
  
  .disclaimer-box {
    margin-top: var(--space-6);
    padding: var(--space-4);
    background: rgba(234, 179, 8, 0.1);
    border: 1px solid rgba(234, 179, 8, 0.3);
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
    color: var(--color-text-subtle);
  }
  
  .no-issues {
    padding: var(--space-6);
    margin-top: var(--space-6);
    text-align: center;
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.3);
    border-radius: var(--radius-md);
    color: #22c55e;
    font-weight: 600;
  }
`;
document.head.appendChild(style);
