(() => {
  'use strict';
  const form = document.querySelector('#unlock-form');
  const field = document.querySelector('#review-password');
  const message = document.querySelector('#unlock-message');
  const gate = document.querySelector('#preview-gate');
  const content = document.querySelector('#interview-content');
  const lock = document.querySelector('#lock-preview');
  const bytes = text => Uint8Array.from(atob(text), value => value.charCodeAt(0));
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const button = form.querySelector('button');
    button.disabled = true;
    message.textContent = 'Opening review…';
    try {
      const response = await fetch('./content.json', {cache: 'no-store', credentials: 'omit'});
      if (!response.ok) throw new Error('Unavailable');
      const data = await response.json();
      const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(field.value.trim()), 'PBKDF2', false, ['deriveKey']);
      const key = await crypto.subtle.deriveKey({name: 'PBKDF2', salt: bytes(data.salt), iterations: data.iterations, hash: 'SHA-256'}, material, {name: 'AES-GCM', length: 256}, false, ['decrypt']);
      const plain = await crypto.subtle.decrypt({name: 'AES-GCM', iv: bytes(data.iv)}, key, bytes(data.ciphertext));
      // Only authenticated, publisher-generated HTML is decrypted into this container.
      content.innerHTML = new TextDecoder().decode(plain);
      field.value = '';
      gate.hidden = true;
      content.hidden = false;
      lock.hidden = false;
      message.textContent = '';
      const heading = content.querySelector('h1');
      heading.tabIndex = -1;
      heading.focus();
    } catch {
      message.textContent = 'Unable to open the review. Check the password and try again.';
    } finally { button.disabled = false; }
  });
  lock.addEventListener('click', () => {
    content.replaceChildren();
    content.hidden = true;
    gate.hidden = false;
    lock.hidden = true;
    field.value = '';
    field.focus();
    scrollTo(0, 0);
  });
})();
