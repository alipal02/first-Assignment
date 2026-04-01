class NotificationSystem {
  constructor() {
    this.createContainer();
    this.createModalContainer();
  }

  createContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    this.container = container;
  }

  createModalContainer() {
    let modalOverlay = document.getElementById('modal-overlay');
    if (!modalOverlay) {
      modalOverlay = document.createElement('div');
      modalOverlay.id = 'modal-overlay';
      modalOverlay.className = 'modal-overlay';
      modalOverlay.innerHTML = `
        <div class="modal-box">
          <h3 id="modal-title">Confirm</h3>
          <p id="modal-message">Are you sure?</p>
          <div class="modal-actions">
            <button id="modal-cancel-btn" class="modal-btn modal-cancel">Cancel</button>
            <button id="modal-confirm-btn" class="modal-btn modal-confirm">Confirm</button>
          </div>
        </div>
      `;
      document.body.appendChild(modalOverlay);
    }
    this.modalOverlay = modalOverlay;
    this.cancelBtn = document.getElementById('modal-cancel-btn');
    this.confirmBtn = document.getElementById('modal-confirm-btn');
    this.modalTitle = document.getElementById('modal-title');
    this.modalMessage = document.getElementById('modal-message');
  }

  showToast(message, type = 'success', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';
    if (type === 'info') icon = 'fa-info-circle';

    toast.innerHTML = `
      <i class="fa-solid ${icon}"></i>
      <span>${message}</span>
    `;

    this.container.appendChild(toast);

    // Trigger reflow for animation
    void toast.offsetWidth;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
      toast.addEventListener('transitionend', () => toast.remove());
    }, duration);
  }

  showConfirm(title, message, onConfirm) {
    this.modalTitle.textContent = title;
    this.modalMessage.textContent = message;
    this.modalOverlay.classList.add('show');

    // Clean up old listeners
    const newCancelBtn = this.cancelBtn.cloneNode(true);
    const newConfirmBtn = this.confirmBtn.cloneNode(true);
    this.cancelBtn.replaceWith(newCancelBtn);
    this.confirmBtn.replaceWith(newConfirmBtn);
    this.cancelBtn = newCancelBtn;
    this.confirmBtn = newConfirmBtn;

    this.cancelBtn.addEventListener('click', () => {
      this.modalOverlay.classList.remove('show');
    });

    this.confirmBtn.addEventListener('click', () => {
      this.modalOverlay.classList.remove('show');
      if (typeof onConfirm === 'function') onConfirm();
    });
  }
}

// Global instance
window.notifier = new NotificationSystem();
