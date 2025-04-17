import React from 'react';
import { Field, FieldTypeEnum, DropdownOption } from './store';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Upload, X, FileIcon, FileText, ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Helper function to apply input mask
function applyMask(value: string, mask: string, slotChar: string = '_'): string {
  if (!mask || !value) return value;

  let maskedValue = '';
  let valueIndex = 0;

  for (let i = 0; i < mask.length; i++) {
    const maskChar = mask[i];
    const valueChar = value[valueIndex];

    if (!valueChar) {
      // If we've run out of input, fill with slot char
      if (maskChar === '9' || maskChar === 'a' || maskChar === '*') {
        maskedValue += slotChar;
      } else {
        maskedValue += maskChar;
      }
    } else if (maskChar === '9') {
      // Only allow numbers
      if (/\d/.test(valueChar)) {
        maskedValue += valueChar;
        valueIndex++;
      } else {
        maskedValue += slotChar;
      }
    } else if (maskChar === 'a') {
      // Only allow letters
      if (/[a-zA-Z]/.test(valueChar)) {
        maskedValue += valueChar;
        valueIndex++;
      } else {
        maskedValue += slotChar;
      }
    } else if (maskChar === '*') {
      // Allow any character
      maskedValue += valueChar;
      valueIndex++;
    } else {
      // For fixed mask characters, add them directly
      maskedValue += maskChar;

      // If the input matches the mask character, consume it
      if (valueChar === maskChar) {
        valueIndex++;
      }
    }
  }

  return maskedValue;
}

// Helper function to unmask a value
function unmaskValue(value: string, mask: string): string {
  if (!mask || !value) return value;

  let unmaskedValue = '';

  for (let i = 0; i < value.length; i++) {
    const maskChar = mask[i];
    const valueChar = value[i];

    // Only keep characters that match the mask pattern
    if ((maskChar === '9' && /\d/.test(valueChar)) ||
        (maskChar === 'a' && /[a-zA-Z]/.test(valueChar)) ||
        (maskChar === '*')) {
      unmaskedValue += valueChar;
    }
  }

  return unmaskedValue;
}

/**
 * Renders a field based on its configuration
 * @param field The field configuration
 * @param value The current value of the field
 * @param onChange Callback when the field value changes
 * @returns A React component for the field
 */
export function renderField(field: Field, value: any, onChange: (value: any) => void) {
  // If field is not visible, don't render it
  if (field.isVisible === false) {
    return null;
  }

  // Get field attributes and validations
  const attributes = field.attributes || {};
  const validations = field.validations || {};

  // Common props for all field types
  const commonProps = {
    id: field.apiId,
    name: field.apiId,
    disabled: attributes.disabled,
    required: validations.required || field.required,
    'aria-label': field.displayName || field.name,
    'aria-describedby': `${field.apiId}-description`,
  };

  // Render field based on type
  switch (field.type) {
    case FieldTypeEnum.INPUT_MASK:
      return (
        <div className="space-y-2">
          <Label htmlFor={field.apiId}>{field.displayName || field.name}</Label>
          <div className="relative">
            {attributes.icon && (
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-gray-500">{attributes.icon}</span>
              </div>
            )}
            <Input
              {...commonProps}
              type="text"
              placeholder={attributes.placeholder}
              value={value || ''}
              onChange={(e) => {
                // Get the raw input value
                const rawValue = e.target.value;

                // Apply the mask
                const maskedValue = applyMask(rawValue, attributes.mask || '', attributes.slotChar || '_');

                // Update the value
                onChange(maskedValue);
              }}
              onBlur={(e) => {
                // Validate on blur
                let isValid = true;
                const validations = field.validations || {};
                const value = e.target.value;

                // Get the value to validate (masked or unmasked)
                const valueToValidate = validations.unmask ? unmaskValue(value, attributes.mask || '') : value;

                // Check required
                if (validations.required && !valueToValidate) {
                  isValid = false;
                }

                // Check mask completeness
                if (validations.mask && value) {
                  // Check if all required mask characters are filled
                  const mask = validations.mask;
                  let requiredChars = 0;
                  let filledChars = 0;

                  for (let i = 0; i < mask.length; i++) {
                    if (mask[i] === '9' || mask[i] === 'a' || mask[i] === '*') {
                      requiredChars++;
                      if (i < value.length && value[i] !== attributes.slotChar) {
                        filledChars++;
                      }
                    }
                  }

                  if (filledChars < requiredChars) {
                    isValid = false;
                  }
                }

                // Check regex pattern
                if (validations.regex && valueToValidate) {
                  try {
                    const regex = new RegExp(validations.regex);
                    if (!regex.test(valueToValidate)) {
                      isValid = false;
                    }
                  } catch (error) {
                    console.error('Invalid regex pattern:', validations.regex);
                  }
                }

                // Update invalid state
                if (attributes.invalid !== !isValid) {
                  const newAttributes = { ...attributes, invalid: !isValid };
                  // This would typically update the field's attributes in the store
                  console.log('Field validation:', field.name, isValid ? 'valid' : 'invalid');
                }
              }}
              className={cn(
                attributes.invalid && 'border-red-500',
                attributes.icon && 'pl-10',
                attributes.variant === 'filled' && 'bg-gray-100'
              )}
            />
          </div>
          {field.description && (
            <p id={`${field.apiId}-description`} className="text-sm text-muted-foreground">
              {field.description}
            </p>
          )}
          {attributes.helpText && (
            <p className="text-xs text-muted-foreground">{attributes.helpText}</p>
          )}
        </div>
      );

    case FieldTypeEnum.TEXT:
      return (
        <div className="space-y-2">
          <Label htmlFor={field.apiId}>{field.displayName || field.name}</Label>
          <div className="relative">
            {attributes.icon && (
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-gray-500">{attributes.icon}</span>
              </div>
            )}
            <Input
              {...commonProps}
              type="text"
              placeholder={attributes.placeholder}
              value={value || ''}
              onChange={(e) => {
                // Apply keyfilter if specified
                let inputValue = e.target.value;
                if (attributes.keyfilter) {
                  switch (attributes.keyfilter) {
                    case 'int':
                      // Allow integers (positive/negative)
                      if (!/^-?\d*$/.test(inputValue)) return;
                      break;
                    case 'pint':
                      // Allow positive integers
                      if (!/^\d*$/.test(inputValue)) return;
                      break;
                    case 'num':
                      // Allow numbers (decimal/integer)
                      if (!/^-?\d*\.?\d*$/.test(inputValue)) return;
                      break;
                    case 'pnum':
                      // Allow positive numbers
                      if (!/^\d*\.?\d*$/.test(inputValue)) return;
                      break;
                    case 'money':
                      // Allow money format
                      if (!/^-?\d*\.?\d{0,2}$/.test(inputValue)) return;
                      break;
                    case 'hex':
                      // Allow hexadecimal
                      if (!/^[0-9a-fA-F]*$/.test(inputValue)) return;
                      break;
                    case 'alpha':
                      // Allow alphabetic
                      if (!/^[a-zA-Z]*$/.test(inputValue)) return;
                      break;
                    case 'alphanum':
                      // Allow alphanumeric
                      if (!/^[a-zA-Z0-9]*$/.test(inputValue)) return;
                      break;
                    case 'email':
                      // Allow email format (basic check)
                      // Full validation happens on blur
                      break;
                  }
                }

                onChange(inputValue);
              }}
              onBlur={(e) => {
                // Validate on blur if needed
                let isValid = true;
                const validations = field.validations || {};
                const value = e.target.value;

                // Check min length
                if (validations.minLength && value.length < validations.minLength) {
                  isValid = false;
                }

                // Check max length
                if (validations.maxLength && value.length > validations.maxLength) {
                  isValid = false;
                }

                // Check regex pattern
                if (validations.regex && value) {
                  try {
                    const regex = new RegExp(validations.regex);
                    if (!regex.test(value)) {
                      isValid = false;
                    }
                  } catch (error) {
                    console.error('Invalid regex pattern:', validations.regex);
                  }
                }

                // Update invalid state
                if (attributes.invalid !== !isValid) {
                  const newAttributes = { ...attributes, invalid: !isValid };
                  // This would typically update the field's attributes in the store
                  // For now, we'll just log it
                  console.log('Field validation:', field.name, isValid ? 'valid' : 'invalid');
                }

                // API validation would happen here if apiUrl is specified
                if (validations.apiUrl && value) {
                  // This would typically make an API call to validate
                  console.log('API validation would call:', validations.apiUrl);
                }
              }}
              className={cn(
                attributes.invalid && 'border-red-500',
                attributes.icon && 'pl-10',
                attributes.variant === 'filled' && 'bg-gray-100'
              )}
            />
            {attributes.tooltip && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span
                  className="text-gray-500 cursor-help"
                  title={attributes.tooltip}
                  data-tooltip-position={attributes.tooltipPosition || 'top'}
                  data-tooltip-event={attributes.tooltipEvent || 'hover'}
                >
                  ?
                </span>
              </div>
            )}
          </div>
          {field.description && (
            <p id={`${field.apiId}-description`} className="text-sm text-muted-foreground">
              {field.description}
            </p>
          )}
          {attributes.helpText && (
            <p className="text-xs text-muted-foreground">{attributes.helpText}</p>
          )}
        </div>
      );

    case FieldTypeEnum.RICH_TEXT_BLOCKS:
    case FieldTypeEnum.RICH_TEXT_MARKDOWN:
      return (
        <div className="space-y-2">
          <Label htmlFor={field.apiId}>{field.displayName || field.name}</Label>
          <Textarea
            {...commonProps}
            placeholder={attributes.placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            rows={attributes.rows || 5}
            className={cn(attributes.invalid && 'border-red-500', attributes.autoResize && 'resize-y')}
          />
          {field.description && (
            <p id={`${field.apiId}-description`} className="text-sm text-muted-foreground">
              {field.description}
            </p>
          )}
        </div>
      );

    case FieldTypeEnum.NUMBER:
      return (
        <div className="space-y-2">
          <Label htmlFor={field.apiId}>{field.displayName || field.name}</Label>
          <div className="relative">
            {attributes.icon && (
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-gray-500">{attributes.icon}</span>
              </div>
            )}
            <div className={cn(
              "flex",
              attributes.showButtons && attributes.buttonLayout === 'horizontal' && "flex-row",
              attributes.showButtons && attributes.buttonLayout === 'vertical' && "flex-col",
            )}>
              {attributes.showButtons && (attributes.buttonLayout === 'horizontal' || attributes.buttonLayout === 'vertical') && (
                <button
                  type="button"
                  className={cn(
                    "flex items-center justify-center p-2 border border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100",
                    attributes.decrementButtonClassName
                  )}
                  onClick={() => {
                    const step = attributes.step || 1;
                    const newValue = (parseFloat(value) || 0) - step;
                    const min = attributes.min !== undefined ? attributes.min : -Infinity;
                    if (newValue >= min) {
                      onChange(newValue);
                    }
                  }}
                  disabled={attributes.disabled}
                >
                  {attributes.decrementButtonIcon || '-'}
                </button>
              )}

              <div className="relative flex-grow">
                {attributes.prefix && (
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-gray-500">{attributes.prefix}</span>
                  </div>
                )}
                <Input
                  {...commonProps}
                  type="number"
                  placeholder={attributes.placeholder}
                  value={value || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    let parsedValue = val ? parseFloat(val) : null;

                    // Apply min/max constraints
                    if (parsedValue !== null) {
                      if (attributes.min !== undefined && parsedValue < attributes.min) {
                        parsedValue = attributes.min;
                      }
                      if (attributes.max !== undefined && parsedValue > attributes.max) {
                        parsedValue = attributes.max;
                      }
                    }

                    onChange(parsedValue);
                  }}
                  onBlur={(e) => {
                    // Validate on blur
                    let isValid = true;
                    const validations = field.validations || {};
                    const value = parseFloat(e.target.value);

                    if (!isNaN(value)) {
                      // Check min value
                      if (validations.minValue !== undefined && value < validations.minValue) {
                        isValid = false;
                      }

                      // Check max value
                      if (validations.maxValue !== undefined && value > validations.maxValue) {
                        isValid = false;
                      }

                      // Check fraction digits
                      const decimalPart = value.toString().split('.')[1] || '';
                      if (validations.minFractionDigits !== undefined && decimalPart.length < validations.minFractionDigits) {
                        isValid = false;
                      }
                      if (validations.maxFractionDigits !== undefined && decimalPart.length > validations.maxFractionDigits) {
                        isValid = false;
                      }
                    }

                    // Update invalid state
                    if (attributes.invalid !== !isValid) {
                      const newAttributes = { ...attributes, invalid: !isValid };
                      // This would typically update the field's attributes in the store
                      console.log('Field validation:', field.name, isValid ? 'valid' : 'invalid');
                    }
                  }}
                  min={attributes.min}
                  max={attributes.max}
                  step={attributes.step}
                  className={cn(
                    attributes.invalid && 'border-red-500',
                    attributes.icon && 'pl-10',
                    attributes.prefix && 'pl-8',
                    attributes.suffix && 'pr-8',
                    attributes.variant === 'filled' && 'bg-gray-100'
                  )}
                />
                {attributes.suffix && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-500">{attributes.suffix}</span>
                  </div>
                )}
              </div>

              {attributes.showButtons && (attributes.buttonLayout === 'horizontal' || attributes.buttonLayout === 'vertical') && (
                <button
                  type="button"
                  className={cn(
                    "flex items-center justify-center p-2 border border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100",
                    attributes.incrementButtonClassName
                  )}
                  onClick={() => {
                    const step = attributes.step || 1;
                    const newValue = (parseFloat(value) || 0) + step;
                    const max = attributes.max !== undefined ? attributes.max : Infinity;
                    if (newValue <= max) {
                      onChange(newValue);
                    }
                  }}
                  disabled={attributes.disabled}
                >
                  {attributes.incrementButtonIcon || '+'}
                </button>
              )}
            </div>

            {attributes.showButtons && attributes.buttonLayout === 'stacked' && (
              <div className="absolute inset-y-0 right-0 flex flex-col">
                <button
                  type="button"
                  className={cn(
                    "flex-1 flex items-center justify-center w-8 border-l border-t-0 border-r-0 border-b-0 border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100",
                    attributes.incrementButtonClassName
                  )}
                  onClick={() => {
                    const step = attributes.step || 1;
                    const newValue = (parseFloat(value) || 0) + step;
                    const max = attributes.max !== undefined ? attributes.max : Infinity;
                    if (newValue <= max) {
                      onChange(newValue);
                    }
                  }}
                  disabled={attributes.disabled}
                >
                  {attributes.incrementButtonIcon || '+'}
                </button>
                <button
                  type="button"
                  className={cn(
                    "flex-1 flex items-center justify-center w-8 border-l border-t border-r-0 border-b-0 border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100",
                    attributes.decrementButtonClassName
                  )}
                  onClick={() => {
                    const step = attributes.step || 1;
                    const newValue = (parseFloat(value) || 0) - step;
                    const min = attributes.min !== undefined ? attributes.min : -Infinity;
                    if (newValue >= min) {
                      onChange(newValue);
                    }
                  }}
                  disabled={attributes.disabled}
                >
                  {attributes.decrementButtonIcon || '-'}
                </button>
              </div>
            )}
          </div>
          {field.description && (
            <p id={`${field.apiId}-description`} className="text-sm text-muted-foreground">
              {field.description}
            </p>
          )}
          {attributes.helpText && (
            <p className="text-xs text-muted-foreground">{attributes.helpText}</p>
          )}
        </div>
      );

    case FieldTypeEnum.BOOLEAN:
      return (
        <div className="flex items-center justify-between space-x-2">
          <div className="space-y-0.5">
            <Label htmlFor={field.apiId}>{field.displayName || field.name}</Label>
            {field.description && (
              <p id={`${field.apiId}-description`} className="text-sm text-muted-foreground">
                {field.description}
              </p>
            )}
          </div>
          <Switch
            {...commonProps}
            checked={value || false}
            onCheckedChange={onChange}
          />
        </div>
      );

    case FieldTypeEnum.DATE:
      return (
        <div className="space-y-2">
          <Label htmlFor={field.apiId}>{field.displayName || field.name}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !value && "text-muted-foreground",
                  attributes.invalid && 'border-red-500'
                )}
                disabled={attributes.disabled}
              >
                {attributes.showIcon && <CalendarIcon className="mr-2 h-4 w-4" />}
                {value ? format(new Date(value), attributes.dateFormat || 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode={attributes.selectionMode === 'single' ? 'single' : 'multiple'}
                selected={value ? new Date(value) : undefined}
                onSelect={onChange}
                disabled={attributes.disabled}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {field.description && (
            <p id={`${field.apiId}-description`} className="text-sm text-muted-foreground">
              {field.description}
            </p>
          )}
        </div>
      );

    case FieldTypeEnum.JSON:
      return (
        <div className="space-y-2">
          <Label htmlFor={field.apiId}>{field.displayName || field.name}</Label>
          <Textarea
            {...commonProps}
            placeholder={attributes.placeholder || '{\n  "key": "value"\n}'}
            value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value || ''}
            onChange={(e) => {
              try {
                const jsonValue = JSON.parse(e.target.value);
                onChange(jsonValue);
              } catch (error) {
                // If not valid JSON, just store as string
                onChange(e.target.value);
              }
            }}
            rows={attributes.rows || 10}
            className={cn(attributes.invalid && 'border-red-500', attributes.autoResize && 'resize-y')}
          />
          {field.description && (
            <p id={`${field.apiId}-description`} className="text-sm text-muted-foreground">
              {field.description}
            </p>
          )}
        </div>
      );

    case FieldTypeEnum.EMAIL:
      return (
        <div className="space-y-2">
          <Label htmlFor={field.apiId}>{field.displayName || field.name}</Label>
          <Input
            {...commonProps}
            type="email"
            placeholder={attributes.placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={cn(attributes.invalid && 'border-red-500')}
          />
          {field.description && (
            <p id={`${field.apiId}-description`} className="text-sm text-muted-foreground">
              {field.description}
            </p>
          )}
        </div>
      );

    case FieldTypeEnum.PASSWORD:
      return (
        <div className="space-y-2">
          <Label htmlFor={field.apiId}>{field.displayName || field.name}</Label>
          <div className="relative">
            {attributes.icon && (
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-gray-500">{attributes.icon}</span>
              </div>
            )}
            <div className="relative">
              <Input
                {...commonProps}
                type={attributes.toggleMask !== false ? 'password' : 'text'}
                placeholder={attributes.promptLabel || 'Enter password'}
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                className={cn(
                  attributes.invalid && 'border-red-500',
                  attributes.icon && 'pl-10',
                  attributes.variant === 'filled' && 'bg-gray-100'
                )}
                disabled={attributes.disabled}
              />
              {attributes.toggleMask !== false && (
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => {
                    // Toggle password visibility
                    const input = document.getElementById(field.apiId) as HTMLInputElement;
                    if (input) {
                      input.type = input.type === 'password' ? 'text' : 'password';
                    }
                  }}
                >
                  <span className="text-gray-500">
                    {/* Eye icon for show/hide password */}
                    👁️
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Password strength indicator */}
          {attributes.feedback !== false && value && (
            <div className="mt-2">
              <div className="text-xs mb-1">
                {getPasswordStrength(value as string) === 'weak' && attributes.weakLabel}
                {getPasswordStrength(value as string) === 'medium' && attributes.mediumLabel}
                {getPasswordStrength(value as string) === 'strong' && attributes.strongLabel}
              </div>
              <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full',
                    getPasswordStrength(value as string) === 'weak' && 'w-1/3 bg-red-500',
                    getPasswordStrength(value as string) === 'medium' && 'w-2/3 bg-yellow-500',
                    getPasswordStrength(value as string) === 'strong' && 'w-full bg-green-500'
                  )}
                />
              </div>
            </div>
          )}

          {field.description && (
            <p id={`${field.apiId}-description`} className="text-sm text-muted-foreground">
              {field.description}
            </p>
          )}
        </div>
      );

    // Helper function to determine password strength
    function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
      if (!password) return 'weak';

      // Calculate password strength
      let score = 0;

      // Length check
      if (password.length >= 8) score += 1;
      if (password.length >= 12) score += 1;

      // Character variety checks
      if (/[A-Z]/.test(password)) score += 1; // Has uppercase
      if (/[a-z]/.test(password)) score += 1; // Has lowercase
      if (/[0-9]/.test(password)) score += 1; // Has number
      if (/[^A-Za-z0-9]/.test(password)) score += 1; // Has special char

      // Determine strength based on score
      if (score < 3) return 'weak';
      if (score < 5) return 'medium';
      return 'strong';
    }

    case FieldTypeEnum.AUTOCOMPLETE:
      return (
        <div className="space-y-2">
          <Label htmlFor={field.apiId}>{field.displayName || field.name}</Label>
          <div className="relative">
            {attributes.icon && (
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-gray-500">{attributes.icon}</span>
              </div>
            )}
            <div className="relative">
              <Input
                {...commonProps}
                type="text"
                placeholder={attributes.placeholder || 'Start typing...'}
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                className={cn(
                  attributes.invalid && 'border-red-500',
                  attributes.icon && 'pl-10',
                  attributes.variant === 'filled' && 'bg-gray-100'
                )}
              />
              {value && attributes.dropdown !== false && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                  <div className="p-2 text-sm text-gray-500">
                    {/* This would be populated with actual suggestions in a real implementation */}
                    <div className="p-2 hover:bg-gray-100 cursor-pointer rounded-md">
                      Sample suggestion 1
                    </div>
                    <div className="p-2 hover:bg-gray-100 cursor-pointer rounded-md">
                      Sample suggestion 2
                    </div>
                    <div className="p-2 hover:bg-gray-100 cursor-pointer rounded-md">
                      Sample suggestion 3
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {field.description && (
            <p id={`${field.apiId}-description`} className="text-sm text-muted-foreground">
              {field.description}
            </p>
          )}
        </div>
      );

    case FieldTypeEnum.CASCADE_SELECT:
      return (
        <div className="space-y-2">
          <Label htmlFor={field.apiId}>{field.displayName || field.name}</Label>
          <div className="relative">
            <div
              className={cn(
                "flex items-center justify-between px-3 py-2 border rounded-md cursor-pointer",
                attributes.invalid && 'border-red-500',
                attributes.variant === 'filled' && 'bg-gray-100',
                attributes.disabled && 'opacity-50 cursor-not-allowed'
              )}
              onClick={() => {
                if (!attributes.disabled) {
                  // This would toggle the cascade select dropdown in a real implementation
                }
              }}
            >
              <span className="text-sm">{value ? value : (attributes.placeholder || 'Select a value...')}</span>
              <span className="text-gray-500">▼</span> {/* Dropdown arrow */}
            </div>

            {/* This would be the cascade select dropdown in a real implementation */}
            <div className="hidden absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg overflow-hidden">
              <div className="flex">
                {/* First level */}
                <div className="w-1/3 border-r">
                  <div className="p-2 hover:bg-blue-50 cursor-pointer border-l-2 border-blue-500">Australia</div>
                  <div className="p-2 hover:bg-blue-50 cursor-pointer">Canada</div>
                  <div className="p-2 hover:bg-blue-50 cursor-pointer">United States</div>
                </div>

                {/* Second level */}
                <div className="w-1/3 border-r">
                  <div className="p-2 hover:bg-blue-50 cursor-pointer">California</div>
                  <div className="p-2 hover:bg-blue-50 cursor-pointer">Florida</div>
                  <div className="p-2 hover:bg-blue-50 cursor-pointer">Texas</div>
                </div>

                {/* Third level */}
                <div className="w-1/3">
                  <div className="p-2 hover:bg-blue-50 cursor-pointer">Los Angeles</div>
                  <div className="p-2 hover:bg-blue-50 cursor-pointer">San Diego</div>
                  <div className="p-2 hover:bg-blue-50 cursor-pointer">San Francisco</div>
                </div>
              </div>
            </div>
          </div>
          {field.description && (
            <p id={`${field.apiId}-description`} className="text-sm text-muted-foreground">
              {field.description}
            </p>
          )}
        </div>
      );

    case FieldTypeEnum.DROPDOWN:
      return (
        <div className="space-y-2">
          <Label htmlFor={field.apiId}>{field.displayName || field.name}</Label>
          <div className="relative">
            <div
              className={cn(
                "flex items-center justify-between px-3 py-2 border rounded-md cursor-pointer",
                attributes.invalid && 'border-red-500',
                attributes.variant === 'filled' && 'bg-gray-100',
                attributes.disabled && 'opacity-50 cursor-not-allowed'
              )}
              onClick={() => {
                if (!attributes.disabled) {
                  // This would toggle the dropdown in a real implementation
                }
              }}
            >
              <span className="text-sm">{value ? value : (attributes.placeholder || 'Select an option...')}</span>
              <div className="flex items-center">
                {attributes.showClear && value && (
                  <button
                    type="button"
                    className="mr-1 text-gray-400 hover:text-gray-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(null);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                )}
                <span className="text-gray-500">▼</span> {/* Dropdown arrow */}
              </div>
            </div>

            {/* This would be the dropdown options in a real implementation */}
            <div className="hidden absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
              {attributes.filter && (
                <div className="p-2 border-b">
                  <Input
                    placeholder="Search..."
                    className="w-full"
                  />
                </div>
              )}
              <div className="py-1">
                {attributes.options && attributes.options.length > 0 ? (
                  attributes.options.map((option: DropdownOption, index: number) => (
                    <div
                      key={index}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                      onClick={() => onChange(option.value)}
                    >
                      <div className="flex items-center">
                        {option.icon && (
                          <span className="mr-2" style={{ color: option.color || 'inherit' }}>{option.icon}</span>
                        )}
                        <span>{option.text}</span>
                      </div>
                      {attributes.checkmark && value === option.value && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-gray-500 text-center">No options available</div>
                )}
              </div>
            </div>
          </div>
          {field.description && (
            <p id={`${field.apiId}-description`} className="text-sm text-muted-foreground">
              {field.description}
            </p>
          )}
        </div>
      );

    case FieldTypeEnum.MEDIA:
      return (
        <div className="space-y-2">
          <Label htmlFor={field.apiId}>{field.displayName || field.name}</Label>

          {/* File upload area */}
          <div
            className={cn(
              "border-2 border-dashed rounded-md p-6 transition-colors",
              "border-muted-foreground/20 hover:border-primary/50",
              attributes.invalid && "border-red-500"
            )}
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
              (e.currentTarget as HTMLDivElement).classList.add("border-primary", "bg-primary/5");
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              (e.currentTarget as HTMLDivElement).classList.remove("border-primary", "bg-primary/5");
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              (e.currentTarget as HTMLDivElement).classList.remove("border-primary", "bg-primary/5");

              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                const files = Array.from(e.dataTransfer.files);

                // Validate file types if accept is specified
                let validFiles = files;
                if (attributes.accept) {
                  const acceptTypes = attributes.accept.split(',').map(type => type.trim());
                  validFiles = files.filter(file => {
                    const fileType = file.type;

                    // Check if file type matches any of the accepted types
                    return acceptTypes.some(acceptType => {
                      if (acceptType.startsWith('.')) {
                        // Check file extension
                        return file.name.toLowerCase().endsWith(acceptType.toLowerCase());
                      } else if (acceptType.includes('*')) {
                        // Handle wildcards like image/*
                        const [category] = acceptType.split('/');
                        return fileType.startsWith(`${category}/`);
                      } else {
                        // Exact match
                        return fileType === acceptType;
                      }
                    });
                  });
                }

                // Validate file size if specified
                if (attributes.minFileSize || attributes.maxFileSize) {
                  validFiles = validFiles.filter(file => {
                    if (attributes.minFileSize && file.size < attributes.minFileSize) {
                      return false;
                    }
                    if (attributes.maxFileSize && file.size > attributes.maxFileSize) {
                      return false;
                    }
                    return true;
                  });
                }

                // Update value
                if (validFiles.length > 0) {
                  onChange(attributes.multiple ? validFiles : validFiles[0]);
                }
              }
            }}
          >
            <div className="flex flex-col items-center justify-center space-y-2 text-center">
              <div className="p-3 rounded-full bg-primary/10">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {attributes.chooseLabel || 'Drag and drop files or click to upload'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {attributes.accept ? `Accepted formats: ${attributes.accept}` : 'All file types accepted'}
                  {attributes.maxFileSize && ` • Max size: ${(attributes.maxFileSize / (1024 * 1024)).toFixed(0)} MB`}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById(`${field.apiId}-file-input`)?.click()}
                disabled={attributes.disabled}
              >
                Choose file{attributes.multiple && 's'}
              </Button>
              <input
                id={`${field.apiId}-file-input`}
                type="file"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    const files = Array.from(e.target.files);
                    onChange(attributes.multiple ? files : files[0]);
                  }
                }}
                accept={attributes.accept}
                multiple={attributes.multiple}
                disabled={attributes.disabled}
              />
            </div>
          </div>

          {/* Display selected file(s) */}
          {value && (
            <div className="space-y-2 mt-4">
              <p className="text-sm font-medium">Selected file{Array.isArray(value) && value.length > 1 ? 's' : ''}</p>
              <div className="space-y-2">
                {Array.isArray(value) ? (
                  value.map((file: File, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-muted rounded-md">
                          {file.type.startsWith('image/') ? (
                            <ImageIcon className="h-6 w-6" />
                          ) : file.type.startsWith('text/') ? (
                            <FileText className="h-6 w-6" />
                          ) : (
                            <FileIcon className="h-6 w-6" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {file.size < 1024 ?
                              `${file.size} B` :
                              file.size < 1024 * 1024 ?
                                `${(file.size / 1024).toFixed(1)} KB` :
                                `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                            }
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newFiles = [...value];
                          newFiles.splice(index, 1);
                          onChange(newFiles.length > 0 ? newFiles : null);
                        }}
                        disabled={attributes.disabled}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-between p-2 border rounded-md">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-muted rounded-md">
                        {value.type?.startsWith('image/') ? (
                          <ImageIcon className="h-6 w-6" />
                        ) : value.type?.startsWith('text/') ? (
                          <FileText className="h-6 w-6" />
                        ) : (
                          <FileIcon className="h-6 w-6" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium truncate max-w-[200px]">{value.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {value.size < 1024 ?
                            `${value.size} B` :
                            value.size < 1024 * 1024 ?
                              `${(value.size / 1024).toFixed(1)} KB` :
                              `${(value.size / (1024 * 1024)).toFixed(1)} MB`
                          }
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onChange(null)}
                      disabled={attributes.disabled}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {field.description && (
            <p id={`${field.apiId}-description`} className="text-sm text-muted-foreground">
              {field.description}
            </p>
          )}
          {attributes.helpText && (
            <p className="text-xs text-muted-foreground">{attributes.helpText}</p>
          )}
        </div>
      );

    case FieldTypeEnum.INPUT_TEXTAREA:
      return (
        <div className="space-y-2">
          <Label htmlFor={field.apiId}>{field.displayName || field.name}</Label>
          <div className="relative">
            <Textarea
              {...commonProps}
              placeholder={attributes.placeholder || `Enter ${field.name.toLowerCase()}`}
              value={value || ''}
              onChange={(e) => {
                // Apply keyfilter if specified
                let inputValue = e.target.value;
                if (attributes.keyfilter) {
                  switch (attributes.keyfilter) {
                    case 'int':
                      // Allow integers (positive/negative)
                      if (!/^-?\d*$/.test(inputValue)) return;
                      break;
                    case 'pint':
                      // Allow positive integers
                      if (!/^\d*$/.test(inputValue)) return;
                      break;
                    case 'num':
                      // Allow numbers (decimal/integer)
                      if (!/^-?\d*\.?\d*$/.test(inputValue)) return;
                      break;
                    case 'pnum':
                      // Allow positive numbers
                      if (!/^\d*\.?\d*$/.test(inputValue)) return;
                      break;
                    case 'alpha':
                      // Allow alphabetic
                      if (!/^[a-zA-Z]*$/.test(inputValue)) return;
                      break;
                    case 'alphanum':
                      // Allow alphanumeric
                      if (!/^[a-zA-Z0-9]*$/.test(inputValue)) return;
                      break;
                  }
                }

                onChange(inputValue);
              }}
              onBlur={(e) => {
                // Validate on blur
                let isValid = true;
                const validations = field.validations || {};
                const value = e.target.value;

                // Check required
                if (validations.required && !value) {
                  isValid = false;
                }

                // Check min length
                if (validations.minLength && value.length < validations.minLength) {
                  isValid = false;
                }

                // Check max length
                if (validations.maxLength && value.length > validations.maxLength) {
                  isValid = false;
                }

                // Update invalid state
                if (attributes.invalid !== !isValid) {
                  const newAttributes = { ...attributes, invalid: !isValid };
                  // This would typically update the field's attributes in the store
                  console.log('Field validation:', field.name, isValid ? 'valid' : 'invalid');
                }
              }}
              rows={attributes.rows || 5}
              cols={attributes.cols}
              className={cn(
                attributes.invalid && 'border-red-500',
                attributes.autoResize && 'resize-y',
                attributes.variant === 'filled' && 'bg-gray-100'
              )}
              style={{
                minHeight: attributes.rows ? `${attributes.rows * 1.5}rem` : undefined
              }}
            />
          </div>
          {field.description && (
            <p id={`${field.apiId}-description`} className="text-sm text-muted-foreground">
              {field.description}
            </p>
          )}
          {attributes.helpText && (
            <p className="text-xs text-muted-foreground">{attributes.helpText}</p>
          )}
        </div>
      );

    // Add more field types as needed

    default:
      return (
        <div className="space-y-2">
          <Label htmlFor={field.apiId}>{field.displayName || field.name}</Label>
          <Input
            {...commonProps}
            type="text"
            placeholder={attributes.placeholder || `Enter ${field.name.toLowerCase()}`}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={cn(attributes.invalid && 'border-red-500')}
          />
          {field.description && (
            <p id={`${field.apiId}-description`} className="text-sm text-muted-foreground">
              {field.description}
            </p>
          )}
        </div>
      );
  }
}
