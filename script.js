(function () {
  'use strict';

  const form = document.getElementById('application-form');
  const fullName = document.getElementById('fullName');
  const phone = document.getElementById('phone');
  const idNumber = document.getElementById('idNumber');
  const age = document.getElementById('age');
  const center = document.getElementById('center');
  const email = document.getElementById('email');
  const photo = document.getElementById('photo');
  const submitBtn = document.getElementById('submitBtn');
  const successOverlay = document.getElementById('successOverlay');
  const resetBtn = document.getElementById('resetBtn');
  const fileUpload = document.getElementById('fileUpload');
  const previewContainer = document.getElementById('previewContainer');
  const photoPreview = document.getElementById('photoPreview');
  const removePhoto = document.getElementById('removePhoto');

  const SUPABASE_URL = 'https://igwyjgccjeixuqhrddaj.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlnd3lqZ2NjamVpeHVxaHJkZGFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4Mjc0NDgsImV4cCI6MjEwMTQwMzQ0OH0.-oGczliol2YQCRuss4wgi_qTC5FeahzBW_TGK9YXtuQ';

  function getErrorEl(input) {
    switch (input) {
      case fullName: return document.getElementById('nameError');
      case phone: return document.getElementById('phoneError');
      case idNumber: return document.getElementById('idError');
      case age: return document.getElementById('ageError');
      case center: return document.getElementById('centerError');
      case email: return document.getElementById('emailError');
      default: return null;
    }
  }

  function showError(input, msg) {
    const el = getErrorEl(input);
    if (!el) return;
    el.textContent = msg;
    el.classList.add('visible');
    input.classList.add('error');
    input.classList.remove('success');
  }

  function hideError(input) {
    const el = getErrorEl(input);
    if (!el) return;
    el.classList.remove('visible');
    input.classList.remove('error');
    input.classList.add('success');
  }

  function clearAllErrors() {
    [fullName, phone, idNumber, age, center, email].forEach(input => {
      const el = getErrorEl(input);
      if (!el) return;
      el.classList.remove('visible');
      input.classList.remove('error', 'success');
    });
  }

  function validateName() {
    const val = fullName.value.trim();
    if (val.length < 6) {
      showError(fullName, 'يرجى إدخال الاسم الثلاثي الكامل');
      return false;
    }
    if (val.split(/\s+/).length < 3) {
      showError(fullName, 'يرجى إدخال الاسم الثلاثي (ثلاث كلمات على الأقل)');
      return false;
    }
    hideError(fullName);
    return true;
  }

  function validatePhone() {
    const val = phone.value.trim();
    const re = /^(05|06|07)[0-9]{8}$/;
    if (!re.test(val)) {
      showError(phone, 'يرجى إدخال رقم هاتف سعودي صحيح (05xxxxxxxx)');
      return false;
    }
    hideError(phone);
    return true;
  }

  function validateId() {
    const val = idNumber.value.trim();
    if (val.length < 5) {
      showError(idNumber, 'يرجى إدخال رقم هوية صحيح');
      return false;
    }
    if (!/^\d+$/.test(val)) {
      showError(idNumber, 'رقم الهوية يجب أن يحتوي على أرقام فقط');
      return false;
    }
    hideError(idNumber);
    return true;
  }

  function validateAge() {
    const val = age.value.trim();
    const num = Number(val);
    if (!val || !Number.isInteger(num) || num < 15 || num > 90) {
      showError(age, 'يرجى إدخال عمر صحيح (15 - 90)');
      return false;
    }
    hideError(age);
    return true;
  }

  function validateCenter() {
    if (!center.value) {
      showError(center, 'يرجى اختيار المركز');
      return false;
    }
    hideError(center);
    return true;
  }

  function validateEmail() {
    const val = email.value.trim();
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(val)) {
      showError(email, 'يرجى إدخال بريد إلكتروني صحيح');
      return false;
    }
    hideError(email);
    return true;
  }

  function validatePhoto() {
    const photoError = document.getElementById('photoError');
    if (!photo.files || photo.files.length === 0) {
      photoError.textContent = 'يرجى اختيار صورة واضحة';
      photoError.classList.add('visible');
      fileUpload.classList.remove('has-file');
      return false;
    }
    const file = photo.files[0];
    if (!file.type.match(/^image\/(jpeg|png|jpg)$/)) {
      photoError.textContent = 'يرجى اختيار صورة بصيغة jpg أو png';
      photoError.classList.add('visible');
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      photoError.textContent = 'حجم الصورة يجب أن لا يتجاوز 5MB';
      photoError.classList.add('visible');
      return false;
    }
    photoError.classList.remove('visible');
    fileUpload.classList.add('has-file');
    return true;
  }

  function validateField(input) {
    switch (input) {
      case fullName: return validateName();
      case phone: return validatePhone();
      case idNumber: return validateId();
      case age: return validateAge();
      case center: return validateCenter();
      case email: return validateEmail();
      case photo: return validatePhoto();
      default: return true;
    }
  }

  fullName.addEventListener('blur', validateName);
  phone.addEventListener('blur', validatePhone);
  idNumber.addEventListener('blur', validateId);
  age.addEventListener('blur', validateAge);
  center.addEventListener('change', validateCenter);
  email.addEventListener('blur', validateEmail);

  fullName.addEventListener('input', function () {
    if (this.classList.contains('error') || this.classList.contains('success')) validateName();
  });
  phone.addEventListener('input', function () {
    if (this.classList.contains('error') || this.classList.contains('success')) validatePhone();
  });
  idNumber.addEventListener('input', function () {
    if (this.classList.contains('error') || this.classList.contains('success')) validateId();
  });
  age.addEventListener('input', function () {
    if (this.classList.contains('error') || this.classList.contains('success')) validateAge();
  });
  email.addEventListener('input', function () {
    if (this.classList.contains('error') || this.classList.contains('success')) validateEmail();
  });

  photo.addEventListener('change', function () {
    const photoError = document.getElementById('photoError');
    if (this.files && this.files.length > 0) {
      const file = this.files[0];
      if (file.type.match(/^image\/(jpeg|png|jpg)$/) && file.size <= 5 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onload = function (e) {
          photoPreview.src = e.target.result;
          previewContainer.classList.add('visible');
        };
        reader.readAsDataURL(file);
        validatePhoto();
      } else {
        validatePhoto();
        previewContainer.classList.remove('visible');
      }
    } else {
      photoError.classList.remove('visible');
      previewContainer.classList.remove('visible');
      fileUpload.classList.remove('has-file');
    }
  });

  removePhoto.addEventListener('click', function (e) {
    e.stopPropagation();
    photo.value = '';
    previewContainer.classList.remove('visible');
    photoPreview.src = '';
    fileUpload.classList.remove('has-file');
    document.getElementById('photoError').classList.remove('visible');
  });

  fileUpload.addEventListener('dragover', function (e) {
    e.preventDefault();
    this.classList.add('dragover');
  });

  fileUpload.addEventListener('dragleave', function () {
    this.classList.remove('dragover');
  });

  fileUpload.addEventListener('drop', function (e) {
    e.preventDefault();
    this.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      photo.files = e.dataTransfer.files;
      photo.dispatchEvent(new Event('change'));
    }
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (submitBtn.disabled) return;

    const isValid =
      validateName() &
      validatePhone() &
      validateId() &
      validateAge() &
      validateCenter() &
      validateEmail() &
      validatePhoto();

    if (!isValid) {
      const firstError = form.querySelector('.error');
      if (firstError) firstError.focus();
      return;
    }

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    const appData = {
      fullName: fullName.value.trim(),
      phone: phone.value.trim(),
      idNumber: idNumber.value.trim(),
      age: Number(age.value.trim()),
      center: center.value,
      email: email.value.trim()
    };

    const file = photo.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        appData.photo = e.target.result;
        saveToLocal(appData);
        submitToSupabase(appData);
      };
      reader.readAsDataURL(file);
    } else {
      appData.photo = '';
      saveToLocal(appData);
      submitToSupabase(appData);
    }
  });

  function submitToSupabase(data) {
    fetch(SUPABASE_URL + '/rest/v1/applications', {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(data)
    })
    .then(function (res) {
      submitBtn.classList.remove('loading');
      if (!res.ok) {
        submitBtn.disabled = false;
        return res.json().catch(function () { return {}; }).then(function (err) {
          throw new Error(err.message || ('HTTP ' + res.status));
        });
      }
      successOverlay.classList.add('visible');
    })
    .catch(function (err) {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
      alert('تعذر حفظ الطلب، يرجى المحاولة مرة أخرى.\n' + err.message);
    });
  }

  function saveToLocal(data) {
    try {
      const apps = JSON.parse(localStorage.getItem('diamond_applications') || '[]');
      apps.unshift(data);
      localStorage.setItem('diamond_applications', JSON.stringify(apps));
    } catch (e) {}
  }

  resetBtn.addEventListener('click', function () {
    form.reset();
    submitBtn.disabled = false;
    successOverlay.classList.remove('visible');
    clearAllErrors();
    previewContainer.classList.remove('visible');
    photoPreview.src = '';
    fileUpload.classList.remove('has-file');
      window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  successOverlay.addEventListener('click', function (e) {
    if (e.target === this) {
      resetBtn.click();
    }
  });

  function createSparkles() {
    const container = document.getElementById('sparkle-container');
    for (let i = 0; i < 50; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'sparkle';
      sparkle.style.left = Math.random() * 100 + '%';
      sparkle.style.width = (Math.random() * 4 + 2) + 'px';
      sparkle.style.height = sparkle.style.width;
      sparkle.style.animationDuration = (Math.random() * 10 + 8) + 's';
      sparkle.style.animationDelay = (Math.random() * 10) + 's';
      sparkle.style.opacity = '0';
      container.appendChild(sparkle);
    }
  }

  createSparkles();

  const hash = window.location.hash.replace('#', '');
  if (hash === 'success') {
    setTimeout(function () {
      successOverlay.classList.add('visible');
    }, 500);
  }

})();
