/**
 * Main JavaScript file for SavingsCalc application
 */

document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', function() {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // Flash messages auto-dismiss
  const flashMessages = document.querySelectorAll('.flash-message');
  
  flashMessages.forEach(message => {
    setTimeout(() => {
      message.classList.add('opacity-0');
      setTimeout(() => {
        message.remove();
      }, 300);
    }, 5000);
  });

  // Date range filter helper
  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');
  
  if (startDateInput && endDateInput) {
    startDateInput.addEventListener('change', function() {
      if (endDateInput.value && new Date(startDateInput.value) > new Date(endDateInput.value)) {
        endDateInput.value = startDateInput.value;
      }
    });
    
    endDateInput.addEventListener('change', function() {
      if (startDateInput.value && new Date(endDateInput.value) < new Date(startDateInput.value)) {
        startDateInput.value = endDateInput.value;
      }
    });
  }

  // Confirm delete actions
  const deleteButtons = document.querySelectorAll('.delete-button');
  
  deleteButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
        e.preventDefault();
      }
    });
  });
});