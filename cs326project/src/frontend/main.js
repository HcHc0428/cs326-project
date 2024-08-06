document.addEventListener('DOMContentLoaded', function() {
    const URL = "http://localhost:3260";

    const interestCategory = document.getElementById('interest-category');
    const interestsContainer = document.querySelector('.interests-container');

    function showSelectedInterests(category) {
        document.querySelectorAll('.interest').forEach(interest => {
            interest.style.display = interest.classList.contains(category) || category === 'all' ? 'flex' : 'none';
        });
    }

    function addInterest() {
        const category = document.getElementById('category').value.toLowerCase();
        const interest = document.getElementById('interest').value;
        fetch(URL + '/interests', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({category, interest})
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const newInterest = document.createElement('div');
                newInterest.className = 'interest ' + category;
                newInterest.textContent = interest;
                interestsContainer.appendChild(newInterest);
                newInterest.addEventListener('click', function() {
                    newInterest.classList.toggle('active');
                });
                newInterest.classList.add('active');
            } else {
                throw new Error(data.message);
            }
        })
        .catch(error => {
            console.error('Error adding interest:', error);
            alert('Failed to add interest: ' + error.message);
        });
    }



    function loadInterests() {
        fetch(URL + '/interests', {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                data.interests.forEach(interest => {
                    const interestElement = document.createElement('div');
                    interestElement.className = 'interest ' + interest.category;
                    interestElement.textContent = interest.description;
                    interestElement.classList.add('active');
                    interestsContainer.appendChild(interestElement);
                });
            } else {
                throw new Error(data.message);
            }
        })
        .catch(error => {
            console.error('Error loading interests:', error);
            alert('Failed to load interests: ' + error.message);
        });
    }

    if (interestCategory) {
        interestCategory.addEventListener('change', function() {
            showSelectedInterests(this.value);
        });
        document.getElementById('add-interest-form').addEventListener('submit', function(event) {
            event.preventDefault();
            addInterest();
            closePopupForm();
        });

        loadInterests();
        showSelectedInterests(interestCategory.value);
    }

    // Initialize time grid functionality
    const timeGrid = document.querySelector('.time-grid');
    const times = ['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM', '10 PM'];

    if (timeGrid) {
        times.forEach(time => {
            const timeLabel = document.createElement('div');
            timeLabel.className = 'time-label';
            timeLabel.textContent = time;
            timeGrid.appendChild(timeLabel);

            for (let i = 0; i < 7; i++) {
                const timeSlot = document.createElement('div');
                timeSlot.className = 'time-slot';
                timeSlot.dataset.time = time;
                timeSlot.dataset.day = i + 1; // Monday is 1, Sunday is 7
                timeGrid.appendChild(timeSlot);

                timeSlot.addEventListener('click', function() {
                    timeSlot.classList.toggle('active');
                });
            }
        });
    }

    // Signup
    const createAccountForm = document.getElementById('createAccountForm');
    if (createAccountForm) {
        createAccountForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const user = {
                preferredName: formData.get('preferredName'),
                username: formData.get('username'),
                password: formData.get('password'),
                email: formData.get('email'),
                major: formData.get('major'),
                academicYear: formData.get('academicYear'),
                location: formData.get('location'),
                interests: JSON.parse(localStorage.getItem('userInterests')) || []
            };

            if (!user.preferredName || !user.username || !user.password || !user.email || !user.major || !user.academicYear || !user.location) {
                alert("Please fill out all fields");
                return;
            }

            try {
                const response = await fetch(`${URL}/signup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(user)
                });
                const result = await response.json();
                if (response.ok) {
                    alert("Create account success");
                    localStorage.setItem('currentUser', JSON.stringify(result.user));
                    window.location.href = 'home.html';
                } else {
                    alert(result.message || "Something went wrong, please try again");
                }
            } catch (error) {
                console.error('Something went wrong, please try again:', error);
                alert("Something went wrong, please try again");
            }
        });
    }

    // Signin
    const signinForm = document.getElementById('signinForm');
    if (signinForm) {
        signinForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const user = {
                email: formData.get('email'),
                password: formData.get('password')
            };

            if (!user.email || !user.password) {
                alert("Please fill out email and password");
                return;
            }

            try {
                const response = await fetch(`${URL}/signin`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(user)
                });
                const result = await response.json();
                if (response.ok) {
                    alert("Login success!");
                    localStorage.setItem('currentUser', JSON.stringify(result.user)); 
                    window.location.href = 'home.html'; 
                } else {
                    alert(result.message || "Something went wrong, please try again");
                }
            } catch (error) {
                console.error('Something went wrong, please try again:', error);
                alert("Something went wrong, please try again");
            }
        });
    }

    // Subscribe to events
    const eventList = document.getElementById('event-list');
    if (eventList) {
        eventList.addEventListener('click', function(e) {
            if (e.target.classList.contains('subscribe-button')) {
                const eventId = e.target.getAttribute('data-event-id');
                const event = { id: eventId };
                subscribeToEvent(event);
            }
        });
    }

    async function subscribeToEvent(event) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            alert('Please sign in to subscribe to events');
            return;
        }

        try {
            const response = await fetch(`${URL}/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: currentUser.email, event })
            });

            if (response.ok) {
                alert('Subscribed to the event successfully');
            } else {
                alert('Failed to subscribe to the event');
            }
        } catch (error) {
            console.error('Error subscribing to event:', error);
            alert('Error subscribing to event');
        }
    }
    
    // Save availability to the account
    const saveButton = document.getElementById('save-availability');
    if (saveButton) {
        saveButton.addEventListener('click', function() {
            const availability = [];
            document.querySelectorAll('.time-slot.active').forEach(slot => {
                availability.push({
                    day: slot.dataset.day,
                    time: slot.dataset.time
                });
            });

            // Send availability data to the server
            fetch(`${URL}/saveAvailability`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ availability, currentUser: JSON.parse(localStorage.getItem('currentUser')) })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Availability saved successfully');
                } else {
                    alert('Failed to save availability');
                }
            })
            .catch(error => console.error('Error:', error));
        });
    }

    // Save interests to the account
    const saveInterestsButton = document.getElementById('save-interests');
    if (saveInterestsButton) {
        saveInterestsButton.addEventListener('click', function() {
            const interests = [];
            document.querySelectorAll('.interest.active').forEach(interest => {
                interests.push({
                    category: interest.dataset.category,
                    interest: interest.textContent
                });
            });

            // Send interests data to the server
            fetch(`${URL}/saveInterests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ interests, currentUser: JSON.parse(localStorage.getItem('currentUser')) })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Interests saved successfully');
                } else {
                    alert('Failed to save interests');
                }
            })
            .catch(error => console.error('Error:', error));
        });
    }
});
