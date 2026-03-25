/* ===========================================================================
    Form handler methods.
    This class handles form validation, submission, and errors.
=========================================================================== */

/* global JustValidate, grecaptcha */

class FormHandler {
    /**
     * Holds the error container selector
     *
     * @type {string}
     */
    errorContainer;

    /**
     * Holds the form DOM element
     *
     * @type {HTMLElement}
     */
    form;

    /**
     * Holds the form overlay DOM element
     *
     * @type {HTMLElement}
     */
    formOverlay;

    /**
     * Whether to automatically hide the form overlay after submission
     *
     * @type {boolean}
     */
    formOverlayAutoHide = true;

    /**
     * Holds the form selector
     *
     * @type {string}
     */
    formSelector;

    /**
     * Holds the function name for Google reCAPTCHA v3 handling
     *
     * @type {string}
     */
    reCaptchaV3Function;

    /**
     * Holds the input selector for Google reCAPTCHA v3 handling
     *
     * @type {string}
     */
    reCaptchaV3InputSelector;

    /**
     * Holds the field ids of requried image fields and if they have a value
     */
    requiredImages = {};

    /**
     * Holds the submit button DOM element
     *
     * @type {HTMLElement}
     */
    submitButton;

    /**
     * Holds the submit callback function
     *
     * This is called after the form has been successfully validated
     * and submitted.
     *
     * @type {(response: Response, form: FormHandler) => void}
     */
    submitCallback;

    /**
     * Holds the submit handler function to call if there is an error
     * from submitting the form
     *
     * @type {(errorResponse: Error, form: FormHandler) => void}
     */
    submitErrorCallback;

    /**
     * Holds an optional custom submit handler function.
     * When set, this function is called instead of the default submit logic.
     * The function receives the FormHandler instance as its argument.
     *
     * @type {(formHandler: FormHandler) => void}
     */
    customSubmitHandler;

    /**
     * Whether to use AJAX to submit the form
     *
     * @type {boolean}
     */
    useAjax = false;

    /**
     * Whether to use Google reCAPTCHA v3
     *
     * @type {boolean}
     */
    useRecaptchaV3 = false;

    /**
     * Holds the form validator object
     *
     * @type {JustValidate}
     */
    validator;

    /**
     * Set the error container DOM selector
     *
     * @param {string} selector The error container DOM selector
     */
    setErrorContainerSelector(selector) {
        this.errorContainer = document.querySelector(selector);
    }

    /**
     * Sets that AJAX should be used to submit the form.
     * The class defaults to not using AJAX.
     */
    setUseAjax() {
        this.useAjax = true;
    }

    /**
     * Sets that Google reCAPTCHA v3 should be used with the form.
     * The class defaults to not using reCAPTCHA v3.
     *
     * @param {string} functionName The function name for Google reCAPTCHA v3 handling
     * @param {string} inputSelector The input selector for Google reCAPTCHA v3 handling
     */
    setUseRecaptchaV3(functionName, inputSelector) {
        this.useRecaptchaV3 = true;
        this.reCaptchaV3Function = functionName;
        this.reCaptchaV3InputSelector = inputSelector;
    }

    /**
     * Set the DOM selector for the form
     *
     * @param {string} selector The DOM selector for the form
     */
    setFormSelector(selector) {
        this.formSelector = selector;
        this.form = document.querySelector(selector);
        this.submitButton = this.form.querySelector(
            `${selector} button[type="submit"]`,
        );

        // Set up image handling for file inputs
        this.setupImageUploads();
    }

    /**
     * Set up image uploads for the form
     *
     * @private
     */
    setupImageUploads() {
        // Set up the image handling for the form
        document
            .querySelectorAll(`${this.formSelector} .js-imageInput`)
            .forEach((field) => {
                const hasValue = typeof field.dataset.value !== 'undefined';
                if (field.classList.contains('required')) {
                    this.requiredImages[field.id] = hasValue;
                }

                // Add the event listener to the file input
                field.addEventListener('change', (input) => {
                    if (input.target.files.length > 0) {
                        const file = input.target.files[0];
                        if (/\.(jpe?g|png|gif)$/i.test(file.name)) {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                                // Hide the existing image
                                const existingImgContainer =
                                    document.querySelector(
                                        `.js-currentImgContainer[data-id="${field.id}"]`,
                                    );
                                if (existingImgContainer) {
                                    existingImgContainer.classList.add(
                                        'hidden',
                                    );
                                }
                                // Show the new image
                                const newImgContainer = document.querySelector(
                                    `.js-newImageContainer[data-id="${field.id}"]`,
                                );
                                if (newImgContainer) {
                                    newImgContainer.classList.remove('hidden');
                                    const img = document.querySelector(
                                        `.js-newImage[data-id="${field.id}"]`,
                                    );
                                    if (typeof img !== 'undefined') {
                                        img.src = e.target.result;
                                    }
                                }
                            };
                            reader.readAsDataURL(input.target.files[0]);

                            // Set that the required image field is set if the field is required
                            if (
                                typeof this.requiredImages[field.id] !==
                                'undefined'
                            ) {
                                this.requiredImages[field.id] = true;
                                this.checkRequiredImages();
                            }
                        }
                    }
                });
            });

        // Set up the remove image buttons. This removes the existing image value.
        document
            .querySelectorAll(`${this.formSelector} .js-removeExistingImage`)
            .forEach((button) => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    const fieldId = e.target.dataset.id;

                    // Empty the value of the hidden input field so that when the form is submitted the image is removed
                    const valueField = document.querySelector(
                        `.js-currentImageValue[data-id="${fieldId}"]`,
                    );
                    if (valueField) {
                        valueField.name = valueField.dataset.name;
                    }

                    // Hide the existing image
                    const existingImgContainer = document.querySelector(
                        `.js-currentImgContainer[data-id="${fieldId}"]`,
                    );
                    if (existingImgContainer) {
                        existingImgContainer.classList.add('hidden');
                    }

                    // Show the cancel button
                    const cancelButton = document.querySelector(
                        `.js-removeExistingImageCancelContainer[data-id="${fieldId}"]`,
                    );
                    if (cancelButton) {
                        cancelButton.classList.remove('hidden');
                    }

                    // Set that the required image field is empty if the field is required
                    if (typeof this.requiredImages[fieldId] !== 'undefined') {
                        this.requiredImages[fieldId] = false;
                        this.checkRequiredImages();
                    }
                });
            });

        // Set up the cancel remove image buttons. This restores the existing image value.
        document
            .querySelectorAll(
                `${this.formSelector} .js-removeExistingImageCancel`,
            )
            .forEach((button) => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    const fieldId = e.target.dataset.id;

                    // Remove the name of the hidden input field so that when the form is submitted the image is not removed
                    const valueField = document.querySelector(
                        `.js-currentImageValue[data-id="${fieldId}"]`,
                    );
                    if (valueField) {
                        valueField.name = '';
                    }

                    // Show the existing image
                    const existingImgContainer = document.querySelector(
                        `.js-currentImgContainer[data-id="${fieldId}"]`,
                    );
                    if (existingImgContainer) {
                        existingImgContainer.classList.remove('hidden');
                    }

                    // Hide the cancel button
                    const cancelButton = document.querySelector(
                        `.js-removeExistingImageCancelContainer[data-id="${fieldId}"]`,
                    );
                    if (cancelButton) {
                        cancelButton.classList.add('hidden');
                    }

                    // Set that the required image field is filled if the field is required
                    if (typeof this.requiredImages[fieldId] !== 'undefined') {
                        this.requiredImages[fieldId] = true;
                        this.checkRequiredImages();
                    }
                });
            });

        // Set up the remove new image buttons. This removes the new image value.
        document
            .querySelectorAll(`${this.formSelector} .js-removeNewImage`)
            .forEach((button) => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    const fieldId = e.target.dataset.id;

                    // Empty the value of the file upload field so that no image is uploaded
                    const imageUploadField = document.getElementById(fieldId);
                    if (imageUploadField) {
                        imageUploadField.value = '';
                    }

                    // Hide the new image
                    const newImgContainer = document.querySelector(
                        `.js-newImageContainer[data-id="${fieldId}"]`,
                    );
                    if (newImgContainer) {
                        newImgContainer.classList.add('hidden');
                    }

                    // Set that the required image field is empty if the field is required
                    if (typeof this.requiredImages[fieldId] !== 'undefined') {
                        this.requiredImages[fieldId] = false;
                        this.checkRequiredImages();
                    }
                });
            });

        // Set up the undo new image buttons. This removes the new image and restores the original image
        document
            .querySelectorAll(`${this.formSelector} .js-undoNewImage`)
            .forEach((button) => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    const fieldId = e.target.dataset.id;

                    // Empty the value of the file upload field so that no image is uploaded
                    const imageUploadField = document.getElementById(fieldId);
                    if (imageUploadField) {
                        imageUploadField.value = '';
                    }

                    // Hide the new image
                    const newImgContainer = document.querySelector(
                        `.js-newImageContainer[data-id="${fieldId}"]`,
                    );
                    if (newImgContainer) {
                        newImgContainer.classList.add('hidden');
                    }

                    // Show the existing image
                    const existingImgContainer = document.querySelector(
                        `.js-currentImgContainer[data-id="${fieldId}"]`,
                    );
                    if (existingImgContainer) {
                        existingImgContainer.classList.remove('hidden');
                    }

                    // Set that the required image field is filled if the field is required
                    if (typeof this.requiredImages[fieldId] !== 'undefined') {
                        this.requiredImages[fieldId] = true;
                        this.checkRequiredImages();
                    }
                });
            });

        // Check the required image fields
        this.checkRequiredImages();
    }

    /**
     * Check to see if any of the required images have a value. If not then disable the submit button.
     *
     * @private
     */
    checkRequiredImages() {
        // Don't do anything if there are no required images.
        // This includes setting the button as enabled. It's possible
        // that the button was disabled externally and this could re-enable it.
        if (Object.keys(this.requiredImages).length > 0) {
            let disableButton = false;
            Object.values(this.requiredImages).forEach((value) => {
                if (!value) {
                    disableButton = true;
                }
            });
            if (disableButton) {
                this.disableButton();
            } else {
                this.enableButton();
            }
        }
    }

    /**
     * Disable the submit button
     */
    disableButton() {
        if (this.submitButton) {
            this.submitButton.disabled = true;
        }
    }

    /**
     * Enable the submit button
     */
    enableButton() {
        if (this.submitButton) {
            this.submitButton.disabled = false;
        }
    }

    /**
     * Set the DOM selector for the form overlay
     *
     * @param {string} selector The DOM selector for the form overlay
     */
    setFormOverlaySelector(selector) {
        this.formOverlay = document.querySelector(selector);
    }

    /**
     * Set whether the form overlay should automatically hide after submission
     *
     * @param {boolean} autoHide Whether to automatically hide the form overlay after submission
     */
    setFormOverlayAutoHide(autoHide) {
        if (typeof autoHide === 'boolean') {
            this.formOverlayAutoHide = autoHide;
        }
    }

    /**
     * Show the form overlay
     */
    showFormOverlay() {
        if (this.formOverlay) {
            this.formOverlay.style.display = 'block';
        }
    }

    /**
     * Hide the form overlay
     *
     * @param {boolean} force Whether to force the overlay to hide
     */
    hideFormOverlay(force = false) {
        if (this.formOverlay && (this.formOverlayAutoHide || force)) {
            this.formOverlay.style.display = 'none';
        }
    }

    /**
     * Set the callback functions to call after the form has been submitted
     *
     * @param {(response: Response, form: FormHandler) => void} callback The callback function to call after the form has been successfully validated and submitted
     * @param {(errorResponse: Error, form: FormHandler) => void} errorCallback The callback function to call after the form has been succesfully validated but the
     *           submission has failed
     */
    setSubmitCallback(callback, errorCallback) {
        if (typeof callback === 'function') {
            this.submitCallback = callback;
        }
        if (typeof errorCallback === 'function') {
            this.submitErrorCallback = errorCallback;
        }
    }

    /**
     * Set a custom submit handler that replaces the default form submission logic.
     * The handler receives this FormHandler instance as its argument.
     *
     * @param {(formHandler: FormHandler) => void} handler The custom submit handler function
     */
    setCustomSubmitHandler(handler) {
        if (typeof handler === 'function') {
            this.customSubmitHandler = handler;
        }
    }

    /**
     * Initialize the form validation
     */
    initValidation() {
        this.validator = new JustValidate(this.formSelector, {
            focusInvalidField: false,
        });

        // Get the validation rules from the form fields
        this.form
            .querySelectorAll(`${this.formSelector} [data-validate]`)
            .forEach((field) => {
                const rules = [];

                if (typeof field.dataset.validateEmail === 'string') {
                    rules.push({
                        rule: 'email',
                        errorMessage: field.dataset.validateEmail,
                    });
                }

                if (
                    typeof field.dataset.validateMinLength === 'string' &&
                    typeof field.dataset.validateMinLengthValue === 'string'
                ) {
                    rules.push({
                        rule: 'minLength',
                        errorMessage: field.dataset.validateMinLength,
                        value: parseInt(
                            field.dataset.validateMinLengthValue,
                            10,
                        ),
                    });
                }

                if (typeof field.dataset.validateNumber !== 'undefined') {
                    rules.push({
                        rule: 'number',
                        errorMessage: 'Value must be a number',
                    });
                }

                if (typeof field.dataset.validateRequired === 'string') {
                    rules.push({
                        rule: 'required',
                        errorMessage: field.dataset.validateRequired,
                    });
                }

                if (rules.length > 0) {
                    this.addValidationRule(`#${field.id}`, rules);
                }
            });

        // Get the checkbox and radio button fields that are required.
        // The 'data-required-group' attribute is the selector for the group of fields on the div surrounding the field.
        this.form
            .querySelectorAll(`${this.formSelector} [data-required-group]`)
            .forEach((group) => {
                if (typeof group.dataset.requiredGroupId === 'string') {
                    this.addRequiredGroup(
                        `#${group.dataset.requiredGroupId}`,
                        group.dataset.requiredGroup,
                    );
                }
            });

        // Set up what happens when the form is successfully validated
        this.validator.onSuccess(() => {
            if (this.useRecaptchaV3) {
                // Show the overlay and disable the submit button while reCAPTCHA is validated
                this.showFormOverlay();
                this.disableButton();

                window[this.reCaptchaV3Function](grecaptcha, {
                    inputSelector: this.reCaptchaV3InputSelector,
                }).then(() => {
                    this.submit();
                });
            } else {
                this.submit();
            }
        });

        // Scroll to the first invalid field when there are errors.
        // Just-Validate does this but it doesn't work well with mobile.
        // We disable it with "focusInvalidField" and do it ourselves. This also makes the scrolling smoother.
        this.validator.onFail((fields) => {
            const firstInvalid = Object.values(fields).find(
                (field) => !field.isValid,
            );
            if (firstInvalid) {
                firstInvalid.elem.scrollIntoView({ behavior: 'smooth' });
                firstInvalid.elem.focus({ preventScroll: true });
            }
        });
    }

    /**
     * Add one or more validation rules to a field
     *
     * @param {string} fieldSelector The selector for the field
     * @param {Array} rules The array of rules to apply
     */
    addValidationRule(fieldSelector, rules) {
        this.validator.addField(fieldSelector, rules);

        // Handle event listener to revalidate fields when they've been previously invalidated.
        const inputListener = (e) => {
            this.validator
                .revalidateField(`#${e.target.id}`)
                .then((isValid) => {
                    if (isValid) {
                        e.target.removeEventListener('input', inputListener);
                    }
                });
        };

        // Validate the field on blur
        const field = document.querySelector(fieldSelector);
        field.addEventListener('blur', () => {
            this.validator.revalidateField(fieldSelector).then((isValid) => {
                if (!isValid) {
                    field.addEventListener('input', inputListener);
                }
            });
        });
    }

    /**
     * Add a required group of fields
     *
     * This is used for checkboxes and radio buttons that are required to be selected.
     *
     * @param {string} groupSelector The selector for the group of fields
     * @param {string} message The error message to display
     */
    addRequiredGroup(groupSelector, message) {
        this.validator.addRequiredGroup(groupSelector, message);
    }

    /**
     * Submit the form
     */
    submit() {
        // Show the form overlay, disable the submit button, and hide any errors
        this.showFormOverlay();
        this.disableButton();
        this.hideErrors();

        // If a custom submit handler is set, call it instead of the default logic
        if (typeof this.customSubmitHandler === 'function') {
            this.customSubmitHandler(this);
            return;
        }

        if (!this.useAjax) {
            this.form.submit();
        } else {
            this.submitAjax()
                .then((response) => {
                    if (typeof this.submitCallback === 'function') {
                        // response is an instance of Response
                        this.submitCallback(response, this);
                    }
                })
                .catch((errorResponse) => {
                    if (errorResponse instanceof Error) {
                        // There was an error sending the request. This would not be a form validation error.
                        // eslint-disable-next-line no-console
                        console.error('Error submitting form: ', errorResponse);
                    }
                    if (typeof this.submitErrorCallback === 'function') {
                        this.submitErrorCallback(errorResponse, this);
                    } else {
                        this.showError(errorResponse);
                    }
                });
        }
    }

    /**
     * Reset the form
     */
    resetForm() {
        this.form.reset();
        this.validator.refresh();
    }

    /**
     * Submit the form via AJAX
     *
     * @returns {Promise}
     */
    submitAjax() {
        return new Promise((resolve, reject) => {
            const data = new FormData(this.form);
            fetch(this.form.action, {
                method: 'post',
                body: data,
                headers: {
                    Accept: 'application/json',
                },
            })
                .then((response) => {
                    if (response.ok) {
                        response.json().then((jsonData) => {
                            resolve(jsonData);
                        });
                    } else {
                        response.json().then((jsonData) => {
                            reject(jsonData);
                        });
                    }
                })
                .catch((error) => {
                    // There was an error sending the request. This would not be a form validation error.
                    reject(error);
                })
                .finally(() => {
                    this.hideFormOverlay();
                    this.enableButton();
                });
        });
    }

    /**
     * Hide the form error(s)
     */
    hideErrors() {
        if (this.errorContainer) {
            this.errorContainer.innerHTML = '';
            this.errorContainer.classList.add('hidden');
        }
    }

    /**
     * Show the form error
     *
     * The "error" could be the JSON returned from the server and something like this:
     * {
     *   "status": "error",
     *   "message": "Error",
     *   "errorList": [
     *       "Your username and\/or password is incorrect"
     *   ]
     * }
     * or it could be a string message.
     *
     * @param {string|object|Response} error The error message or object
     */
    showError(error) {
        /**
         * Process the error object and return the error HTML string
         *
         * @param {object} errorData The error JSON object
         * @returns {string} The error HTML string
         */
        const processErrorObject = (errorData) => {
            let returnValue = '';
            if (
                typeof errorData.errorList === 'object' ||
                Array.isArray(errorData.errorList)
            ) {
                const errors = Object.values(errorData.errorList);
                if (errors.length === 1) {
                    returnValue += errors[0];
                } else if (errors.length > 1) {
                    returnValue += '<ul class="my-0">';
                    errors.forEach((err) => {
                        returnValue += `<li>${err}</li>`;
                    });
                    returnValue += '</ul>';
                }
            } else if (typeof errorData.message === 'string') {
                returnValue += errorData.message;
            }
            return returnValue;
        };

        /**
         * Output the error
         *
         * @param {string} errorContent The error string or HTML
         */
        const outputError = (errorContent) => {
            const output = `<div class="Message Message--failure mb-5">${errorContent}</div>`;
            this.errorContainer.innerHTML = output;
            this.errorContainer.classList.remove('hidden');
            this.errorContainer.scrollIntoView({ behavior: 'smooth' });
        };

        if (this.errorContainer) {
            if (typeof error === 'string') {
                outputError(error);
            } else if (error instanceof Response) {
                error.json().then((errorData) => {
                    outputError(processErrorObject(errorData));
                });
            } else if (typeof error === 'object') {
                outputError(processErrorObject(error));
            }
        }
    }
}
