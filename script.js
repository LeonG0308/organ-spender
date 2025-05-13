// Bestimme auf welcher Seite wir sind
const currentPage = window.location.pathname.split('/').pop();

// Helper Funktionen für localStorage
function getStoredData(key, defaultValue = []) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
}

function storeData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Cookie Banner Funktionen (index.html)
if (currentPage === "" || currentPage === "index.html") {
    document.addEventListener('DOMContentLoaded', function() {
        // Show cookie banner immediately
        document.getElementById("cookie-banner").style.display = "block";
        
        // Show customize options
        document.getElementById("customize-cookies").addEventListener("click", function() {
            document.getElementById("cookie-customize").classList.toggle("hidden");
        });
        
        // Accept all cookies
        document.getElementById("accept-cookies").addEventListener("click", function() {
            recordCookieChoice("accept");
            document.getElementById("cookie-banner").style.display = "none";
            window.location.href = "survey.html";
        });
        
        // Reject cookies
        document.getElementById("reject-cookies").addEventListener("click", function() {
            recordCookieChoice("reject");
            document.getElementById("cookie-banner").style.display = "none";
            window.location.href = "survey.html";
        });
        
        // Save preferences (same as accept in this experiment)
        document.getElementById("save-preferences").addEventListener("click", function() {
            recordCookieChoice("accept");
            document.getElementById("cookie-banner").style.display = "none";
            window.location.href = "survey.html";
        });
        
        // Function to record the choice in localStorage
        function recordCookieChoice(choice) {
            const cookieChoices = getStoredData('cookieChoices', []);
            cookieChoices.push({
                choice: choice,
                timestamp: new Date().toISOString()
            });
            storeData('cookieChoices', cookieChoices);
        }
    });
}

// Umfrage Funktionen (survey.html)
if (currentPage === "survey.html") {
    document.addEventListener('DOMContentLoaded', function() {
        let selectedAnswer = null;
        
        // Handle answer selection
        document.querySelectorAll("#answer-yes, #answer-no").forEach(button => {
            button.addEventListener("click", function() {
                selectedAnswer = this.id === "answer-yes" ? "yes" : "no";
                
                // Highlight selected button
                document.querySelectorAll(".btn-yes, .btn-no").forEach(btn => {
                    btn.classList.remove("selected");
                });
                this.classList.add("selected");
                
                // Enable submit button
                document.getElementById("submit-survey").disabled = false;
            });
        });
        
        // Handle survey submission
        document.getElementById("submit-survey").addEventListener("click", function() {
            if (selectedAnswer) {
                // Record the answer
                const surveyAnswers = getStoredData('surveyAnswers', []);
                surveyAnswers.push({
                    answer: selectedAnswer,
                    timestamp: new Date().toISOString()
                });
                storeData('surveyAnswers', surveyAnswers);
                
                // Show thank you message
                document.querySelector(".survey-question").style.display = "none";
                document.getElementById("thank-you").classList.remove("hidden");
            }
        });
    });
}

// Admin Funktionen (admin.html)
if (currentPage === "admin.html") {
    document.addEventListener('DOMContentLoaded', function() {
        const correctPassword = "Umfrage";
        let cookieChart = null;
        
        // Handle login
        document.getElementById("login-btn").addEventListener("click", function() {
            login();
        });
        
        // Allow pressing Enter to login
        document.getElementById("password").addEventListener("keypress", function(e) {
            if (e.key === "Enter") {
                login();
            }
        });
        
        function login() {
            const password = document.getElementById("password").value;
            
            if (password === correctPassword) {
                document.getElementById("login-container").style.display = "none";
                document.getElementById("admin-dashboard").classList.remove("hidden");
                loadData();
                
                // Set up auto-refresh
                setInterval(loadData, 5000); // Refresh every 5 seconds
            } else {
                document.getElementById("login-error").classList.remove("hidden");
            }
        }
        
        // Initialize chart
        function initChart(acceptCount, rejectCount) {
            const ctx = document.getElementById('cookie-chart').getContext('2d');
            
            // Destroy existing chart if it exists
            if (cookieChart !== null) {
                cookieChart.destroy();
            }
            
            cookieChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Cookies akzeptiert', 'Cookies abgelehnt'],
                    datasets: [{
                        label: 'Anzahl der Teilnehmer',
                        data: [acceptCount, rejectCount],
                        backgroundColor: [
                            'rgba(75, 192, 192, 0.8)',
                            'rgba(255, 99, 132, 0.8)'
                        ],
                        borderColor: [
                            'rgba(75, 192, 192, 1)',
                            'rgba(255, 99, 132, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                precision: 0
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Cookie-Entscheidungen der Teilnehmer',
                            font: {
                                size: 16
                            }
                        }
                    }
                }
            });
        }
        
        // Load data from localStorage
        function loadData() {
            const cookieChoices = getStoredData('cookieChoices', []);
            
            // Count accepts and rejects
            const acceptCount = cookieChoices.filter(choice => choice.choice === 'accept').length;
            const rejectCount = cookieChoices.filter(choice => choice.choice === 'reject').length;
            const totalCount = acceptCount + rejectCount;
            
            // Update chart
            initChart(acceptCount, rejectCount);
            
            // Update summary stats
            document.getElementById("accept-count").textContent = acceptCount;
            document.getElementById("reject-count").textContent = rejectCount;
            document.getElementById("total-count").textContent = totalCount;
            
            // Calculate and update acceptance rate
            const acceptRate = totalCount > 0 ? 
                Math.round((acceptCount / totalCount) * 100) : 0;
            document.getElementById("accept-rate").textContent = acceptRate + "%";
        }
        
        // Handle manual refresh
        document.getElementById("refresh-btn").addEventListener("click", function() {
            loadData();
        });
        
        // Show reset confirmation
        document.getElementById("reset-btn").addEventListener("click", function() {
            document.getElementById("reset-confirm").classList.remove("hidden");
        });
        
        // Cancel reset
        document.getElementById("cancel-reset").addEventListener("click", function() {
            document.getElementById("reset-confirm").classList.add("hidden");
        });
        
        // Confirm and perform reset
        document.getElementById("confirm-reset").addEventListener("click", function() {
            // Clear localStorage data
            localStorage.removeItem('cookieChoices');
            localStorage.removeItem('surveyAnswers');
            
            document.getElementById("reset-confirm").classList.add("hidden");
            loadData(); // Refresh the data
        });
    });
}