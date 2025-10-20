// ===== ACCESSIBILITY & UI ENHANCEMENTS =====

// Font size management
let currentFontSize = 'base';
const fontSizes = ['small', 'base', 'large', 'xl'];

function toggleFontSize() {
    const currentIndex = fontSizes.indexOf(currentFontSize);
    const nextIndex = (currentIndex + 1) % fontSizes.length;
    currentFontSize = fontSizes[nextIndex];
    
    // Remove all font size classes
    document.body.classList.remove('font-small', 'font-base', 'font-large', 'font-xl');
    // Add new font size class
    document.body.classList.add(`font-${currentFontSize}`);
    
    // Update button indicator
    const btn = document.getElementById('font-size-btn');
    btn.classList.toggle('active', currentFontSize !== 'base');
    
    // Save preference
    localStorage.setItem('fontSize', currentFontSize);
}

// High contrast mode
let highContrastMode = false;

function toggleHighContrast() {
    highContrastMode = !highContrastMode;
    document.body.classList.toggle('high-contrast', highContrastMode);
    
    // Update button indicator
    const btn = document.getElementById('contrast-btn');
    btn.classList.toggle('active', highContrastMode);
    
    // Save preference
    localStorage.setItem('highContrast', highContrastMode);
}

// Loading state management
function showLoading(element, originalText = '') {
    if (element) {
        element.classList.add('btn-loading');
        element.setAttribute('data-original-text', originalText || element.textContent);
        element.disabled = true;
    }
}

function hideLoading(element) {
    if (element) {
        element.classList.remove('btn-loading');
        const originalText = element.getAttribute('data-original-text');
        if (originalText) {
            element.textContent = originalText;
        }
        element.disabled = false;
    }
}

// Skeleton loading for cards
function createSkeletonCard() {
    return `
        <div class="loading-skeleton skeleton-card"></div>
        <div class="loading-skeleton skeleton-text large"></div>
        <div class="loading-skeleton skeleton-text"></div>
        <div class="loading-skeleton skeleton-text small"></div>
    `;
}

// Progress indicator for assessment
function updateProgressIndicator(currentQuestion, totalQuestions) {
    const counter = document.getElementById('question-counter');
    const dots = document.getElementById('progress-dots');
    
    if (counter) {
        counter.textContent = `Question ${currentQuestion} of ${totalQuestions}`;
    }
    
    if (dots) {
        dots.innerHTML = '';
        for (let i = 1; i <= totalQuestions; i++) {
            const dot = document.createElement('div');
            dot.className = 'progress-dot';
            if (i < currentQuestion) {
                dot.classList.add('completed');
            } else if (i === currentQuestion) {
                dot.classList.add('active');
            }
            dots.appendChild(dot);
        }
    }
}

// Enhanced button interactions
function enhanceButtonInteractions() {
    document.querySelectorAll('.btn, .card').forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
        
        element.addEventListener('mousedown', function() {
            this.style.transform = 'translateY(0)';
        });
        
        element.addEventListener('mouseup', function() {
            this.style.transform = 'translateY(-2px)';
        });
    });
}

// Auto-save functionality for journal
let autoSaveTimer;

function setupAutoSave(textareaId, saveFunction) {
    const textarea = document.getElementById(textareaId);
    if (textarea) {
        textarea.addEventListener('input', function() {
            clearTimeout(autoSaveTimer);
            autoSaveTimer = setTimeout(() => {
                saveFunction(this.value);
                showAutoSaveIndicator();
            }, 2000); // Auto-save after 2 seconds of no typing
        });
    }
}

function showAutoSaveIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'auto-save-indicator';
    indicator.textContent = 'Saved automatically';
    indicator.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--success-color);
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 14px;
        z-index: 1001;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(indicator);
    
    // Animate in
    setTimeout(() => indicator.style.opacity = '1', 100);
    
    // Remove after 2 seconds
    setTimeout(() => {
        indicator.style.opacity = '0';
        setTimeout(() => document.body.removeChild(indicator), 300);
    }, 2000);
}

// Notification preferences
let notificationPreferences = {
    dailyReminder: false,
    achievements: true,
    reflectionReminders: true
};

function toggleNotification(type) {
    notificationPreferences[type] = !notificationPreferences[type];
    const toggle = document.getElementById(`${type === 'dailyReminder' ? 'daily-reminder' : type === 'achievements' ? 'achievement' : 'reflection'}-toggle`);
    if (toggle) {
        toggle.classList.toggle('active', notificationPreferences[type]);
    }
    
    // Save preferences
    localStorage.setItem('notificationPreferences', JSON.stringify(notificationPreferences));
}

// Data export functionality
function exportData(format = 'json') {
    const exportData = {
        userData: appState.userData,
        sessions: appState.sessions,
        insights: appState.insights,
        assessmentResults: appState.assessmentResults,
        preferences: {
            fontSize: currentFontSize,
            highContrast: highContrastMode,
            notifications: notificationPreferences
        },
        exportDate: new Date().toISOString(),
        appVersion: '1.0.0'
    };
    
    let content, filename, mimeType;
    
    switch (format) {
        case 'json':
            content = JSON.stringify(exportData, null, 2);
            filename = `boredom_app_data_${new Date().toISOString().split('T')[0]}.json`;
            mimeType = 'application/json';
            break;
            
        case 'csv':
            content = generateCSVExport(exportData);
            filename = `boredom_app_sessions_${new Date().toISOString().split('T')[0]}.csv`;
            mimeType = 'text/csv';
            break;
            
        case 'insights':
            content = generateInsightsExport(exportData);
            filename = `boredom_app_insights_${new Date().toISOString().split('T')[0]}.txt`;
            mimeType = 'text/plain';
            break;
    }
    
    // Create and download file
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Show success message
    showNotification(`Data exported successfully as ${filename}`, 'success');
}

function generateCSVExport(data) {
    const headers = ['Date', 'Challenge', 'Duration (min)', 'Completed', 'Level'];
    const rows = [headers.join(',')];
    
    data.sessions.forEach(session => {
        const row = [
            new Date(session.completedAt).toLocaleDateString(),
            session.challengeId.replace(/[,-]/g, ' '),
            session.duration,
            session.completedFully ? 'Yes' : 'No',
            data.userData.level
        ];
        rows.push(row.join(','));
    });
    
    return rows.join('\n');
}

function generateInsightsExport(data) {
    let content = `Boredom App - Personal Insights Export\n`;
    content += `Export Date: ${new Date().toLocaleDateString()}\n\n`;
    
    content += `=== PERSONAL STATISTICS ===\n`;
    content += `Level: ${data.userData.level}\n`;
    content += `Current Streak: ${data.userData.streak} days\n`;
    content += `Total Sessions: ${data.userData.totalSessions}\n`;
    content += `Total Time: ${data.userData.totalMinutes} minutes\n\n`;
    
    content += `=== INSIGHTS & REFLECTIONS ===\n\n`;
    
    data.insights.forEach((insight, index) => {
        content += `Insight #${index + 1} (${new Date(insight.date).toLocaleDateString()})\n`;
        content += `Challenge: ${insight.challengeId}\n`;
        if (insight.thoughts) content += `Thoughts: ${insight.thoughts}\n`;
        if (insight.creative) content += `Creative Insights: ${insight.creative}\n`;
        if (insight.discomfort) content += `Discomfort Noticed: ${insight.discomfort}\n`;
        if (insight.meaning) content += `Meaning & Purpose: ${insight.meaning}\n`;
        content += `Tags: ${insight.tags.join(', ')}\n\n`;
    });
    
    return content;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${type === 'success' ? 'var(--success-color)' : type === 'error' ? 'var(--danger-color)' : 'var(--primary-color)'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 1001;
        max-width: 300px;
        box-shadow: var(--shadow-lg);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.style.transform = 'translateX(0)', 100);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Initialize accessibility features
function initializeAccessibility() {
    // Load saved preferences
    const savedFontSize = localStorage.getItem('fontSize');
    const savedContrast = localStorage.getItem('highContrast') === 'true';
    const savedNotifications = localStorage.getItem('notificationPreferences');
    
    if (savedFontSize && fontSizes.includes(savedFontSize)) {
        currentFontSize = savedFontSize;
        document.body.classList.add(`font-${currentFontSize}`);
        if (currentFontSize !== 'base') {
            const btn = document.getElementById('font-size-btn');
            if (btn) btn.classList.add('active');
        }
    }
    
    if (savedContrast) {
        highContrastMode = true;
        document.body.classList.add('high-contrast');
        const btn = document.getElementById('contrast-btn');
        if (btn) btn.classList.add('active');
    }
    
    if (savedNotifications) {
        try {
            notificationPreferences = JSON.parse(savedNotifications);
            // Update UI
            Object.keys(notificationPreferences).forEach(key => {
                const toggleId = key === 'dailyReminder' ? 'daily-reminder-toggle' : 
                               key === 'achievements' ? 'achievement-toggle' : 'reflection-toggle';
                const toggle = document.getElementById(toggleId);
                if (toggle) {
                    toggle.classList.toggle('active', notificationPreferences[key]);
                }
            });
        } catch (e) {
            console.warn('Failed to parse notification preferences');
        }
    }
    
    // Enhance button interactions
    enhanceButtonInteractions();
}

// ===== DATA STRUCTURES =====

const CHALLENGES = {
    micro: [
        {
            id: 'micro-1',
            title: 'Commute Without Devices',
            description: 'Travel to your destination without checking your phone or listening to anything',
            duration: 5,
            icon: '🚶',
            tips: [
                'Observe your surroundings - notice details you usually miss',
                'Let your mind wander to whatever comes up naturally',
                'Notice the urge to check your phone without acting on it'
            ],
            unlockLevel: 1
        },
        {
            id: 'micro-2',
            title: 'Waiting in Line Phone-Free',
            description: 'Stand in line without pulling out your phone',
            duration: 10,
            icon: '⏳',
            tips: [
                'Observe the people around you without staring',
                'Practice being present in the moment',
                'Notice what thoughts emerge when you\'re not distracted'
            ],
            unlockLevel: 1
        },
        {
            id: 'micro-3',
            title: 'Morning Coffee in Silence',
            description: 'Enjoy your morning beverage without any devices or reading material',
            duration: 8,
            icon: '☕',
            tips: [
                'Focus on the taste and temperature of your drink',
                'Look out a window and let your mind drift',
                'Notice how silence feels - comfortable or uncomfortable?'
            ],
            unlockLevel: 1
        }
    ],
    meso: [
        {
            id: 'meso-1',
            title: 'Workout Without Music',
            description: 'Exercise without any audio entertainment',
            duration: 20,
            icon: '🏋️',
            tips: [
                'Focus on your breathing and body sensations',
                'Let your mind wander while your body moves',
                'Notice what creative ideas emerge during movement'
            ],
            unlockLevel: 2
        },
        {
            id: 'meso-2',
            title: 'Walk Without Headphones',
            description: 'Take a walk with just your thoughts',
            duration: 15,
            icon: '🚶‍♀️',
            tips: [
                'Listen to the ambient sounds around you',
                'Let your thoughts flow without direction',
                'Pay attention to any insights about your life'
            ],
            unlockLevel: 2
        },
        {
            id: 'meso-3',
            title: 'Sit in Nature',
            description: 'Find a park or outdoor space and simply sit',
            duration: 30,
            icon: '🌳',
            tips: [
                'Watch clouds, trees, or water without purpose',
                'Allow yourself to feel bored - it\'s part of the process',
                'Big questions about meaning often arise in nature'
            ],
            unlockLevel: 2
        }
    ],
    macro: [
        {
            id: 'macro-1',
            title: 'Device-Free Morning',
            description: 'No screens from waking up until noon',
            duration: 60,
            icon: '🌅',
            tips: [
                'Notice the urge to check news or messages',
                'Use this time for deep thinking about your life',
                'Journal your thoughts if they feel important'
            ],
            unlockLevel: 3
        },
        {
            id: 'macro-2',
            title: 'Evening Without Screens',
            description: 'Arthur Brooks protocol: No devices after 7 PM',
            duration: 90,
            icon: '🌙',
            tips: [
                'Have real conversations or spend time in reflection',
                'Read a physical book if you need activity',
                'This is prime time for meaning-making thoughts'
            ],
            unlockLevel: 3
        },
        {
            id: 'macro-3',
            title: 'Meal Prep in Silence',
            description: 'Prepare food without any entertainment or devices',
            duration: 45,
            icon: '🍳',
            tips: [
                'Focus on the cooking process itself',
                'Let your mind wander to whatever it wants',
                'Notice if you feel creative or solve problems mentally'
            ],
            unlockLevel: 4
        }
    ]
};

const ASSESSMENT_QUESTIONS = [
    {
        question: "How often do you check your phone in a typical hour?",
        options: [
            { text: "0-2 times", score: 1 },
            { text: "3-5 times", score: 2 },
            { text: "6-10 times", score: 3 },
            { text: "More than 10 times", score: 4 }
        ],
        category: 'dependency'
    },
    {
        question: "When you have 5 free minutes, what do you usually do?",
        options: [
            { text: "Let my mind wander", score: 1 },
            { text: "Think about tasks", score: 2 },
            { text: "Look for something to do", score: 3 },
            { text: "Immediately grab my phone", score: 4 }
        ],
        category: 'proneness'
    },
    {
        question: "How clear is your sense of life purpose?",
        options: [
            { text: "Very clear - I know what matters", score: 4 },
            { text: "Somewhat clear", score: 3 },
            { text: "Unclear - I'm searching", score: 2 },
            { text: "Very unclear", score: 1 }
        ],
        category: 'meaning'
    },
    {
        question: "How uncomfortable do you feel when you can't use your phone?",
        options: [
            { text: "Not uncomfortable at all", score: 1 },
            { text: "Slightly uncomfortable", score: 2 },
            { text: "Quite uncomfortable", score: 3 },
            { text: "Very anxious", score: 4 }
        ],
        category: 'dependency'
    },
    {
        question: "When was the last time you felt truly bored?",
        options: [
            { text: "Today or yesterday", score: 4 },
            { text: "This week", score: 3 },
            { text: "This month", score: 2 },
            { text: "Can't remember", score: 1 }
        ],
        category: 'proneness'
    },
    {
        question: "How often do you reflect on life's big questions?",
        options: [
            { text: "Daily", score: 4 },
            { text: "Weekly", score: 3 },
            { text: "Rarely", score: 2 },
            { text: "Almost never", score: 1 }
        ],
        category: 'meaning'
    },
    {
        question: "Can you sit in a quiet room for 15 minutes doing nothing?",
        options: [
            { text: "Easily", score: 1 },
            { text: "With some effort", score: 2 },
            { text: "Very difficult", score: 3 },
            { text: "Nearly impossible", score: 4 }
        ],
        category: 'proneness'
    },
    {
        question: "Do you feel your life has meaning?",
        options: [
            { text: "Yes, strongly", score: 4 },
            { text: "Yes, somewhat", score: 3 },
            { text: "Not really", score: 2 },
            { text: "No", score: 1 }
        ],
        category: 'meaning'
    }
];

// ===== STATE MANAGEMENT =====

let appState = {
    currentScreen: 'loading',
    assessmentResults: {
        dependency: 0,
        proneness: 0,
        meaning: 0
    },
    currentAssessmentIndex: 0,
    assessmentAnswers: [],
    userData: {
        level: 1,
        streak: 0,
        totalBoredomTime: 0,
        totalInsights: 0,
        longestSession: 0,
        totalSessions: 0,
        startDate: null,
        lastSessionDate: null
    },
    currentChallenge: null,
    challengeTimer: null,
    challengeStartTime: null,
    challengeDuration: 0,
    reflectionData: {
        thoughts: '',
        creative: '',
        discomfort: '',
        meaning: ''
    },
    currentPromptIndex: 0,
    insights: [],
    completedChallenges: []
};

// ===== LOCAL STORAGE =====

function saveState() {
    try {
        localStorage.setItem('boredomAppState', JSON.stringify(appState));
    } catch (e) {
        console.error('Failed to save state:', e);
    }
}

function loadState() {
    try {
        const saved = localStorage.getItem('boredomAppState');
        if (saved) {
            const parsed = JSON.parse(saved);
            appState = { ...appState, ...parsed };
            // Don't restore screen state on load
            appState.currentScreen = 'loading';
        }
    } catch (e) {
        console.error('Failed to load state:', e);
    }
}

// ===== INITIALIZATION =====

window.addEventListener('DOMContentLoaded', () => {
    loadState();
    initializeAccessibility();
    
    // Simulate loading with better perceived performance
    setTimeout(() => {
        if (!appState.userData.startDate) {
            // New user - show onboarding
            showScreen('onboarding');
        } else {
            // Returning user - show dashboard
            showScreen('dashboard');
            updateDashboard();
        }
    }, 1500); // Reduced loading time
});

// ===== SCREEN MANAGEMENT =====

function showScreen(screenName) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show requested screen
    const screen = document.getElementById(`${screenName}-screen`);
    if (screen) {
        screen.classList.add('active');
        appState.currentScreen = screenName;
        
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Special initializations per screen
        if (screenName === 'dashboard') {
            updateDashboard();
        } else if (screenName === 'challenges') {
            loadChallenges();
        } else if (screenName === 'insights') {
            loadInsights();
        } else if (screenName === 'profile') {
            updateProfile();
        }
        
        saveState();
    }
}

// ===== ONBOARDING =====

function startAssessment() {
    appState.currentAssessmentIndex = 0;
    appState.assessmentAnswers = [];
    showScreen('assessment');
    loadAssessmentQuestion();
}

function loadAssessmentQuestion() {
    const index = appState.currentAssessmentIndex;
    const question = ASSESSMENT_QUESTIONS[index];
    
    document.getElementById('assessment-question').textContent = question.question;
    
    const optionsContainer = document.getElementById('assessment-options');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, i) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = option.text;
        btn.onclick = () => selectOption(i);
        
        if (appState.assessmentAnswers[index] === i) {
            btn.classList.add('selected');
        }
        
        optionsContainer.appendChild(btn);
    });
    
    // Update progress indicators
    updateProgressIndicator(index + 1, ASSESSMENT_QUESTIONS.length);
    const progress = ((index + 1) / ASSESSMENT_QUESTIONS.length) * 100;
    document.getElementById('assessment-progress').style.width = progress + '%';
    
    // Update buttons
    document.getElementById('prev-btn').style.display = index > 0 ? 'block' : 'none';
    const nextBtn = document.getElementById('next-btn');
    nextBtn.textContent = index === ASSESSMENT_QUESTIONS.length - 1 ? 'Complete Assessment' : 'Next';
}

function selectOption(optionIndex) {
    appState.assessmentAnswers[appState.currentAssessmentIndex] = optionIndex;
    
    // Update UI
    document.querySelectorAll('.option-btn').forEach((btn, i) => {
        btn.classList.toggle('selected', i === optionIndex);
    });
}

function nextQuestion() {
    const index = appState.currentAssessmentIndex;
    
    if (appState.assessmentAnswers[index] === undefined) {
        alert('Please select an option');
        return;
    }
    
    if (index === ASSESSMENT_QUESTIONS.length - 1) {
        // Assessment complete
        calculateAssessmentResults();
        initializeUserData();
        showScreen('dashboard');
    } else {
        appState.currentAssessmentIndex++;
        loadAssessmentQuestion();
    }
}

function previousQuestion() {
    if (appState.currentAssessmentIndex > 0) {
        appState.currentAssessmentIndex--;
        loadAssessmentQuestion();
    }
}

function calculateAssessmentResults() {
    const results = { dependency: 0, proneness: 0, meaning: 0 };
    const counts = { dependency: 0, proneness: 0, meaning: 0 };
    
    ASSESSMENT_QUESTIONS.forEach((q, i) => {
        const answer = appState.assessmentAnswers[i];
        const score = q.options[answer].score;
        results[q.category] += score;
        counts[q.category]++;
    });
    
    // Average scores
    Object.keys(results).forEach(category => {
        results[category] = Math.round((results[category] / counts[category]) * 25);
    });
    
    appState.assessmentResults = results;
}

function initializeUserData() {
    appState.userData.startDate = new Date().toISOString();
    appState.userData.level = 1;
    appState.userData.streak = 1;
    saveState();
}

// ===== DASHBOARD =====

function updateDashboard() {
    // Update user stats
    document.getElementById('streak-count').textContent = appState.userData.streak;
    document.getElementById('user-level').textContent = appState.userData.level;
    
    // Update metrics
    document.getElementById('total-boredom-time').textContent = 
        appState.userData.totalBoredomTime + ' min';
    document.getElementById('total-insights').textContent = appState.insights.length;
    
    const toleranceScore = Math.min(100, Math.round(appState.userData.totalBoredomTime / 10));
    document.getElementById('tolerance-score').textContent = toleranceScore + '%';
    
    const freedomScore = Math.max(0, 100 - appState.assessmentResults.dependency);
    document.getElementById('freedom-score').textContent = freedomScore + '%';
    
    // Load today's challenges
    loadTodaysChallenges();
    
    // Load recent insights
    loadRecentInsights();
}

function loadTodaysChallenges() {
    const container = document.getElementById('challenges-container');
    container.innerHTML = '';
    
    // Show 3 recommended challenges
    const recommendedChallenges = [
        ...CHALLENGES.micro.slice(0, 1),
        ...CHALLENGES.meso.slice(0, 1),
        ...CHALLENGES.macro.slice(0, 1)
    ];
    
    recommendedChallenges.forEach(challenge => {
        const isLocked = challenge.unlockLevel > appState.userData.level;
        const card = createChallengeCard(challenge, isLocked);
        container.appendChild(card);
    });
}

function createChallengeCard(challenge, isLocked = false) {
    const card = document.createElement('div');
    card.className = 'challenge-card' + (isLocked ? ' challenge-locked' : '');
    
    card.innerHTML = `
        <div class="challenge-header">
            <div class="challenge-icon">${challenge.icon}</div>
            <div class="challenge-difficulty">${challenge.duration} min</div>
        </div>
        <div class="challenge-title">${challenge.title}</div>
        <div class="challenge-desc">${challenge.description}</div>
        <div class="challenge-meta">
            <span>⏱️ ${challenge.duration} minutes</span>
            ${isLocked ? '<span>🔒 Level ' + challenge.unlockLevel + '</span>' : ''}
        </div>
    `;
    
    if (!isLocked) {
        card.onclick = () => startChallenge(challenge);
    }
    
    return card;
}

function loadRecentInsights() {
    const container = document.getElementById('recent-insights');
    container.innerHTML = '';
    
    const recentInsights = appState.insights.slice(-3).reverse();
    
    if (recentInsights.length === 0) {
        container.innerHTML = '<div class="empty-state">Complete a challenge to capture your first insight</div>';
        return;
    }
    
    recentInsights.forEach(insight => {
        const card = createInsightCard(insight);
        container.appendChild(card);
    });
}

// ===== CHALLENGES =====

function loadChallenges() {
    // Load micro challenges
    const microContainer = document.getElementById('micro-challenges');
    microContainer.innerHTML = '';
    CHALLENGES.micro.forEach(challenge => {
        const isLocked = challenge.unlockLevel > appState.userData.level;
        microContainer.appendChild(createChallengeCard(challenge, isLocked));
    });
    
    // Load meso challenges
    const mesoContainer = document.getElementById('meso-challenges');
    mesoContainer.innerHTML = '';
    CHALLENGES.meso.forEach(challenge => {
        const isLocked = challenge.unlockLevel > appState.userData.level;
        mesoContainer.appendChild(createChallengeCard(challenge, isLocked));
    });
    
    // Load macro challenges
    const macroContainer = document.getElementById('macro-challenges');
    macroContainer.innerHTML = '';
    CHALLENGES.macro.forEach(challenge => {
        const isLocked = challenge.unlockLevel > appState.userData.level;
        macroContainer.appendChild(createChallengeCard(challenge, isLocked));
    });
}

function startChallenge(challenge) {
    appState.currentChallenge = challenge;
    appState.challengeStartTime = Date.now();
    appState.challengeDuration = challenge.duration * 60; // Convert to seconds
    
    showScreen('challenge-active');
    
    document.getElementById('active-challenge-title').textContent = challenge.title;
    document.getElementById('active-challenge-desc').textContent = challenge.description;
    
    // Load tips
    const tipsList = document.getElementById('challenge-tips-list');
    tipsList.innerHTML = '';
    challenge.tips.forEach(tip => {
        const li = document.createElement('li');
        li.textContent = tip;
        tipsList.appendChild(li);
    });
    
    // Start timer
    startChallengeTimer();
}

function startChallengeTimer() {
    const duration = appState.challengeDuration;
    const circle = document.getElementById('timer-circle');
    const circumference = 2 * Math.PI * 90; // radius = 90
    
    circle.style.strokeDasharray = circumference;
    circle.style.strokeDashoffset = 0;
    
    let elapsed = 0;
    
    appState.challengeTimer = setInterval(() => {
        elapsed++;
        const remaining = duration - elapsed;
        
        if (remaining <= 0) {
            completeChallenge();
            return;
        }
        
        // Update timer display
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        document.getElementById('timer-display').textContent = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        // Update circle
        const progress = elapsed / duration;
        circle.style.strokeDashoffset = circumference * (1 - progress);
        
    }, 1000);
}

function pauseChallenge() {
    if (appState.challengeTimer) {
        clearInterval(appState.challengeTimer);
        document.getElementById('pause-btn').textContent = 'Resume';
        document.getElementById('pause-btn').onclick = resumeChallenge;
    }
}

function resumeChallenge() {
    startChallengeTimer();
    document.getElementById('pause-btn').textContent = 'Pause';
    document.getElementById('pause-btn').onclick = pauseChallenge;
}

function endChallengeEarly() {
    if (confirm('Are you sure you want to end this challenge early? Your progress will still be saved.')) {
        completeChallenge(true);
    }
}

function completeChallenge(early = false) {
    if (appState.challengeTimer) {
        clearInterval(appState.challengeTimer);
    }
    
    const actualDuration = Math.floor((Date.now() - appState.challengeStartTime) / 1000 / 60);
    
    // Update user data
    appState.userData.totalBoredomTime += actualDuration;
    appState.userData.totalSessions++;
    appState.userData.longestSession = Math.max(appState.userData.longestSession, actualDuration);
    appState.userData.lastSessionDate = new Date().toISOString();
    
    // Update streak
    updateStreak();
    
    // Check for level up
    checkLevelUp();
    
    // Track completed challenge
    appState.completedChallenges.push({
        challengeId: appState.currentChallenge.id,
        duration: actualDuration,
        completedAt: new Date().toISOString(),
        completedFully: !early
    });
    
    saveState();
    
    // Show reflection screen
    showReflectionScreen(actualDuration);
}

function updateStreak() {
    const lastSession = appState.userData.lastSessionDate;
    if (!lastSession) {
        appState.userData.streak = 1;
        return;
    }
    
    const lastDate = new Date(lastSession);
    const today = new Date();
    const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) {
        appState.userData.streak++;
    } else {
        appState.userData.streak = 1;
    }
}

function checkLevelUp() {
    const sessionsNeeded = appState.userData.level * 3;
    if (appState.userData.totalSessions >= sessionsNeeded) {
        appState.userData.level++;
        // Show notification
        setTimeout(() => {
            alert(`🎉 Level Up! You're now Level ${appState.userData.level}!\n\nNew challenges unlocked.`);
        }, 500);
    }
}

// ===== REFLECTION =====

function showReflectionScreen(duration) {
    showScreen('reflection');
    
    document.getElementById('completed-duration').textContent = duration + ' min';
    document.getElementById('challenge-name-completed').textContent = appState.currentChallenge.title;
    
    // Reset prompts
    appState.currentPromptIndex = 0;
    document.querySelectorAll('.prompt-section').forEach((section, i) => {
        section.classList.toggle('active', i === 0);
    });
    
    // Clear previous reflection data
    appState.reflectionData = {
        thoughts: '',
        creative: '',
        discomfort: '',
        meaning: ''
    };
    
    document.getElementById('reflection-thoughts').value = '';
    document.getElementById('reflection-creative').value = '';
    document.getElementById('reflection-discomfort').value = '';
    document.getElementById('reflection-meaning').value = '';
    
    // Reset word counts
    updateWordCount('reflection-thoughts', 'thoughts-word-count');
    updateWordCount('reflection-creative', 'creative-word-count');
    updateWordCount('reflection-discomfort', 'discomfort-word-count');
    updateWordCount('reflection-meaning', 'meaning-word-count');
    
    // Setup auto-save for all textareas
    setupReflectionAutoSave();
    
    document.getElementById('prev-prompt-btn').style.display = 'none';
    document.getElementById('next-prompt-btn').textContent = 'Next';
}

// Word count functionality
function updateWordCount(textareaId, countElementId) {
    const textarea = document.getElementById(textareaId);
    const countElement = document.getElementById(countElementId);
    
    if (textarea && countElement) {
        const wordCount = textarea.value.trim() ? textarea.value.trim().split(/\s+/).length : 0;
        countElement.textContent = `${wordCount} word${wordCount !== 1 ? 's' : ''}`;
    }
}

// Auto-save functionality for reflection
function setupReflectionAutoSave() {
    const textareas = [
        { id: 'reflection-thoughts', countId: 'thoughts-word-count', statusId: 'thoughts-save-status', field: 'thoughts' },
        { id: 'reflection-creative', countId: 'creative-word-count', statusId: 'creative-save-status', field: 'creative' },
        { id: 'reflection-discomfort', countId: 'discomfort-word-count', statusId: 'discomfort-save-status', field: 'discomfort' },
        { id: 'reflection-meaning', countId: 'meaning-word-count', statusId: 'meaning-save-status', field: 'meaning' }
    ];
    
    textareas.forEach(({ id, countId, statusId, field }) => {
        const textarea = document.getElementById(id);
        const statusElement = document.getElementById(statusId);
        
        if (textarea && statusElement) {
            let saveTimer;
            
            textarea.addEventListener('input', function() {
                // Update word count
                updateWordCount(id, countId);
                
                // Show saving status
                statusElement.textContent = 'Saving...';
                statusElement.className = 'auto-save-status saving';
                
                // Clear previous timer
                clearTimeout(saveTimer);
                
                // Auto-save after 2 seconds of no typing
                saveTimer = setTimeout(() => {
                    appState.reflectionData[field] = this.value;
                    saveState();
                    
                    // Show saved status
                    statusElement.textContent = 'Saved';
                    statusElement.className = 'auto-save-status saved';
                    
                    // Hide status after 2 seconds
                    setTimeout(() => {
                        statusElement.className = 'auto-save-status';
                    }, 2000);
                }, 2000);
            });
        }
    });
}

function nextPrompt() {
    const prompts = ['thoughts', 'creative', 'discomfort', 'meaning'];
    const textareaId = 'reflection-' + prompts[appState.currentPromptIndex];
    appState.reflectionData[prompts[appState.currentPromptIndex]] = 
        document.getElementById(textareaId).value;
    
    if (appState.currentPromptIndex === 3) {
        // Save reflection and return to dashboard
        saveReflection();
        return;
    }
    
    appState.currentPromptIndex++;
    
    document.querySelectorAll('.prompt-section').forEach((section, i) => {
        section.classList.toggle('active', i === appState.currentPromptIndex);
    });
    
    document.getElementById('prev-prompt-btn').style.display = 'block';
    document.getElementById('next-prompt-btn').textContent = 
        appState.currentPromptIndex === 3 ? 'Save & Continue' : 'Next';
}

function previousPrompt() {
    if (appState.currentPromptIndex > 0) {
        appState.currentPromptIndex--;
        
        document.querySelectorAll('.prompt-section').forEach((section, i) => {
            section.classList.toggle('active', i === appState.currentPromptIndex);
        });
        
        document.getElementById('prev-prompt-btn').style.display = 
            appState.currentPromptIndex === 0 ? 'none' : 'block';
        document.getElementById('next-prompt-btn').textContent = 'Next';
    }
}

function skipReflection() {
    if (confirm('Skip reflection? You can still add insights later from the Insights tab.')) {
        showScreen('dashboard');
    }
}

function saveReflection() {
    // Combine all reflection data into insights
    const insight = {
        id: Date.now(),
        challengeId: appState.currentChallenge.id,
        challengeTitle: appState.currentChallenge.title,
        date: new Date().toISOString(),
        thoughts: appState.reflectionData.thoughts,
        creative: appState.reflectionData.creative,
        discomfort: appState.reflectionData.discomfort,
        meaning: appState.reflectionData.meaning,
        tags: determineTags(appState.reflectionData)
    };
    
    appState.insights.push(insight);
    appState.userData.totalInsights = appState.insights.length;
    
    saveState();
    
    showScreen('dashboard');
    
    // Show success message
    setTimeout(() => {
        alert('✅ Insights saved! Great job completing this challenge.');
    }, 500);
}

function determineTags(data) {
    const tags = [];
    
    if (data.creative && data.creative.length > 20) {
        tags.push('creative');
    }
    if (data.meaning && data.meaning.length > 20) {
        tags.push('meaning');
    }
    if (data.thoughts && data.thoughts.length > 20) {
        tags.push('personal');
    }
    
    return tags.length > 0 ? tags : ['general'];
}

// ===== INSIGHTS =====

function loadInsights(filter = 'all') {
    const container = document.getElementById('insights-list');
    container.innerHTML = '';
    
    let filteredInsights = appState.insights;
    
    if (filter !== 'all') {
        filteredInsights = appState.insights.filter(insight => 
            insight.tags.includes(filter)
        );
    }
    
    if (filteredInsights.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">💭</div>
                <p>No insights yet. Complete challenges to capture your thoughts.</p>
            </div>
        `;
        return;
    }
    
    filteredInsights.reverse().forEach(insight => {
        container.appendChild(createInsightCard(insight));
    });
}

function createInsightCard(insight) {
    const card = document.createElement('div');
    card.className = 'insight-card';
    
    const date = new Date(insight.date);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    const mainText = insight.creative || insight.meaning || insight.thoughts || 'Reflection captured';
    
    card.innerHTML = `
        <div class="insight-header">
            <div class="insight-date">${dateStr}</div>
            <div class="insight-tag">${insight.tags[0]}</div>
        </div>
        <div class="insight-text">${mainText.substring(0, 200)}${mainText.length > 200 ? '...' : ''}</div>
        <div class="insight-meta">From: ${insight.challengeTitle}</div>
    `;
    
    return card;
}

function filterInsights(filter) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    loadInsights(filter);
}

function viewAllInsights() {
    showScreen('insights');
}

// ===== PROFILE =====

function updateProfile() {
    document.getElementById('profile-level').textContent = appState.userData.level;
    
    const startDate = new Date(appState.userData.startDate);
    const today = new Date();
    const days = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
    document.getElementById('profile-days').textContent = days;
    
    document.getElementById('total-sessions').textContent = appState.userData.totalSessions;
    document.getElementById('profile-total-time').textContent = appState.userData.totalBoredomTime + ' min';
    document.getElementById('longest-session').textContent = appState.userData.longestSession + ' min';
    document.getElementById('profile-insights').textContent = appState.insights.length;
    document.getElementById('profile-streak').textContent = appState.userData.streak + ' days';
    
    // Update assessment bars
    const proneness = appState.assessmentResults.proneness;
    const dependency = appState.assessmentResults.dependency;
    const meaning = appState.assessmentResults.meaning;
    
    document.getElementById('proneness-bar').style.width = proneness + '%';
    document.getElementById('dependency-bar').style.width = dependency + '%';
    document.getElementById('meaning-bar').style.width = meaning + '%';
    
    document.getElementById('proneness-score').textContent = 
        proneness < 33 ? 'Low' : proneness < 66 ? 'Medium' : 'High';
    document.getElementById('dependency-score').textContent = 
        dependency < 33 ? 'Low' : dependency < 66 ? 'Medium' : 'High';
    document.getElementById('meaning-score').textContent = 
        meaning < 33 ? 'Developing' : meaning < 66 ? 'Growing' : 'Strong';
}

function retakeAssessment() {
    if (confirm('Retake the assessment? This will update your boredom profile.')) {
        startAssessment();
    }
}

function exportData() {
    const data = {
        userData: appState.userData,
        assessmentResults: appState.assessmentResults,
        insights: appState.insights,
        completedChallenges: appState.completedChallenges
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'boredom-app-data.json';
    link.click();
    
    URL.revokeObjectURL(url);
}

function resetProgress() {
    if (confirm('Are you sure? This will delete all your progress and cannot be undone.')) {
        if (confirm('Really sure? All insights and challenge history will be lost.')) {
            localStorage.removeItem('boredomAppState');
            location.reload();
        }
    }
}
