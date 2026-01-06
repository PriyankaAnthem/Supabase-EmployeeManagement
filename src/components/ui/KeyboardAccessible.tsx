// KeyboardNavigation.js
import React from 'react';

/**
 * Setup keyboard navigation for a list of input/select/file fields and buttons
 * @param {Array} refs - Array of React refs to form fields in tab order
 * @param {Object} buttonRefs - Object containing button refs, e.g., { addButton, cancelButton }
 */
export const setupKeyboardNavigation = (refs, buttonRefs) => {
  // Loop through all form refs
  refs.forEach((ref, index) => {
    if (!ref.current) return;

    ref.current.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          if (ref.current.tagName === 'SELECT') {
            ref.current.blur(); // finalize dropdown selection
          } else if (ref.current.type === 'file') {
            // finalize file selection, optionally move focus
          } else {
            const nextRef = refs[index + 1];
            if (nextRef && nextRef.current) nextRef.current.focus();
          }
          break;

        case 'ArrowDown':
          e.preventDefault();
          if (ref.current.tagName === 'SELECT') {
            const nextOption = ref.current.selectedIndex + 1;
            if (nextOption < ref.current.options.length) {
              ref.current.selectedIndex = nextOption;
            }
          } else {
            const nextRef = refs[index + 1];
            if (nextRef && nextRef.current) nextRef.current.focus();
          }
          break;

        case 'ArrowUp':
          e.preventDefault();
          if (ref.current.tagName === 'SELECT') {
            const prevOption = ref.current.selectedIndex - 1;
            if (prevOption >= 0) {
              ref.current.selectedIndex = prevOption;
            }
          } else {
            const prevRef = refs[index - 1];
            if (prevRef && prevRef.current) prevRef.current.focus();
          }
          break;

        default:
          break;
      }
    });
  });

  // Handle double Enter on buttons
  Object.values(buttonRefs).forEach((btnRef) => {
    if (!btnRef.current) return;

    let enterCount = 0;
    btnRef.current.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        enterCount++;
        if (enterCount >= 2) {
          e.preventDefault();
          btnRef.current.click();
          enterCount = 0;
        }
        setTimeout(() => (enterCount = 0), 500); // reset counter after 0.5s
      }
    });
  });
};
