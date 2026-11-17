
// DESTINATION PRICES

var destinationPrices = {
    "Bali, Indonesia": 45000,
    "Switzerland": 120000,
    "Maldives": 65000,
    "Paris, France": 95000,
    "Tokyo, Japan": 75000,
    "South Korea": 85000
};


// RUN AFTER THE PAGE LOADS

document.addEventListener("DOMContentLoaded", function() {

    // AUTOMATIC DESTINATION SELECTION

    var destinationSelect = document.getElementById("destination");

    if (destinationSelect) {

        var urlParameters = new URLSearchParams(window.location.search);
        var selectedDestination = urlParameters.get("destination");

        if (selectedDestination == "Bali") {
            selectedDestination = "Bali, Indonesia";
        }

        if (selectedDestination == "Paris") {
            selectedDestination = "Paris, France";
        }

        if (selectedDestination == "Tokyo") {
            selectedDestination = "Tokyo, Japan";
        }

        destinationSelect.value = selectedDestination;
    }


    // BOOKING FORM

    var bookingForm = document.getElementById("bookingForm");

    if (bookingForm) {

        var departureInput = document.getElementById("departure");
        var returnInput = document.getElementById("returnDate");

        // Set today's date as the earliest departure date

        var today = new Date();
        var todayString = today.getFullYear() + "-" +
            String(today.getMonth() + 1).padStart(2, "0") + "-" +
            String(today.getDate()).padStart(2, "0");

        departureInput.min = todayString;
        returnInput.min = todayString;

        // Update return date when departure date changes

        departureInput.addEventListener("change", function() {
            returnInput.min = departureInput.value;
        });


        bookingForm.addEventListener("submit", function(event) {

            event.preventDefault();

            var fullName = document.getElementById("fullName").value.trim();
            var email = document.getElementById("email").value.trim();
            var destination = destinationSelect.value;
            var travelers = Number(document.getElementById("travelers").value);
            var departure = departureInput.value;
            var returnDate = returnInput.value;
            var budget = Number(document.getElementById("budget").value);
            var message = document.getElementById("message").value.trim();

            var bookingResult = document.getElementById("bookingResult");


            // CHECK DESTINATION

            if (!destinationPrices[destination]) {
                alert("Please select a valid destination.");
                return;
            }


            // CHECK NUMBER OF TRAVELERS

            if (travelers < 1 || travelers > 20) {
                alert("Travelers must be between 1 and 20.");
                return;
            }


            // CHECK BUDGET

            if (budget <= 0) {
                alert("Please enter a valid budget.");
                return;
            }


            // CHECK DATES

            var departureDate = new Date(departure + "T00:00:00");
            var returnDateValue = new Date(returnDate + "T00:00:00");

            if (departureDate < new Date(todayString + "T00:00:00")) {
                alert("Departure date cannot be in the past.");
                return;
            }

            if (returnDateValue <= departureDate) {
                alert("Return date must be after departure date.");
                return;
            }


            // CALCULATE TOTAL PRICE

            var pricePerPerson = destinationPrices[destination];
            var totalCost = pricePerPerson * travelers;


            // SAVE TRIP DETAILS

            var tripDetails = {
                fullName: fullName,
                email: email,
                destination: destination,
                travelers: travelers,
                departure: departure,
                returnDate: returnDate,
                budget: budget,
                message: message,
                pricePerPerson: pricePerPerson,
                totalCost: totalCost
            };

            sessionStorage.setItem("dreamTrip", JSON.stringify(tripDetails));


            // DISPLAY TRIP SUMMARY

            bookingResult.style.display = "block";

            var budgetMessage = "";

            if (totalCost <= budget) {
                budgetMessage = "Within your budget";
            } else {
                budgetMessage = "Estimated cost is above your budget";
            }

            bookingResult.innerHTML =
                "<h2>Your Trip Summary Is Ready!</h2>" +
                "<p><strong>Name:</strong> " + escapeHTML(fullName) + "</p>" +
                "<p><strong>Destination:</strong> " + escapeHTML(destination) + "</p>" +
                "<p><strong>Travelers:</strong> " + travelers + "</p>" +
                "<p><strong>Estimated Total:</strong> ₹" + totalCost.toLocaleString("en-IN") + "</p>" +
                "<p><strong>Your Budget:</strong> ₹" + budget.toLocaleString("en-IN") + "</p>" +
                "<p><strong>Budget Check:</strong> " + budgetMessage + "</p>" +
                '<a href="trip-summary.html" class="btn">View Full Trip Summary</a>';

            bookingResult.scrollIntoView({ behavior: "smooth" });

        });
    }


    // DISPLAY FULL TRIP SUMMARY

    var tripSummary = document.getElementById("tripSummary");

    if (tripSummary) {

        var savedTrip = sessionStorage.getItem("dreamTrip");

        if (savedTrip) {

            var trip = JSON.parse(savedTrip);

            tripSummary.innerHTML =
                "<h2>Trip Details</h2>" +
                "<p><strong>Name:</strong> " + escapeHTML(trip.fullName) + "</p>" +
                "<p><strong>Email:</strong> " + escapeHTML(trip.email) + "</p>" +
                "<p><strong>Destination:</strong> " + escapeHTML(trip.destination) + "</p>" +
                "<p><strong>Travelers:</strong> " + trip.travelers + "</p>" +
                "<p><strong>Departure:</strong> " + escapeHTML(trip.departure) + "</p>" +
                "<p><strong>Return:</strong> " + escapeHTML(trip.returnDate) + "</p>" +
                "<p><strong>Price Per Person:</strong> ₹" + trip.pricePerPerson.toLocaleString("en-IN") + "</p>" +
                "<p><strong>Estimated Total:</strong> ₹" + trip.totalCost.toLocaleString("en-IN") + "</p>" +
                "<p><strong>Your Budget:</strong> ₹" + trip.budget.toLocaleString("en-IN") + "</p>" +
                "<p><strong>Additional Requirements:</strong> " + escapeHTML(trip.message || "None") + "</p>";

        } else {
            tripSummary.innerHTML = "<p>No trip details found. Please complete the booking form first.</p>";
        }
    }


    // DESTINATION SEARCH AND FILTER

    var searchBox = document.getElementById("destinationSearch");
    var buttons = document.getElementsByClassName("filter-btn");
    var cards = document.getElementsByClassName("destination-card");
    var noResults = document.getElementById("noResults");

    var selectedCategory = "all";

    function showDestinations() {

        var searchText = "";

        if (searchBox) {
            searchText = searchBox.value.toLowerCase();
        }

        var count = 0;

        for (var i = 0; i < cards.length; i++) {

            var name = cards[i].getAttribute("data-name").toLowerCase();
            var category = cards[i].getAttribute("data-category");

            var searchMatch = name.indexOf(searchText) !== -1;
            var categoryMatch = false;

            if (selectedCategory == "all" || selectedCategory == category) {
                categoryMatch = true;
            }

            if (searchMatch && categoryMatch) {
                cards[i].style.display = "block";
                count++;
            } else {
                cards[i].style.display = "none";
            }
        }

        if (noResults) {
            if (count == 0) {
                noResults.style.display = "block";
            } else {
                noResults.style.display = "none";
            }
        }
    }


    if (searchBox) {
        searchBox.addEventListener("input", showDestinations);
    }


    for (var j = 0; j < buttons.length; j++) {

        buttons[j].addEventListener("click", function() {

            selectedCategory = this.getAttribute("data-filter");

            for (var k = 0; k < buttons.length; k++) {
                buttons[k].classList.remove("active");
            }

            this.classList.add("active");

            showDestinations();
        });
    }

});


// HTML SECURITY HELPER

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, function(character) {

        var characters = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return characters[character];

    });

}
