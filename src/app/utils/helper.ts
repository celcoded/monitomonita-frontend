import { AbstractControl, FormControl } from "@angular/forms";

export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>;
    keys.forEach(key => {
        if (key in obj) {
            result[key] = obj[key];
        }
    });

    return result;
};

export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    const result = deepClone(obj);
    keys.forEach(key => {
        delete result[key];
    });
    return result;
}

export function deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

export function isEmpty(obj: object): boolean {
    return Object.keys(obj).length === 0;
}

export function merge<T, U>(target: T, source: U): T & U {
    return { ...target, ...source };
}

export function hasKey<T extends object>(obj: T, key: keyof any): key is keyof T {
    return key in obj;
}

export function getErrorMessage(formControl: AbstractControl | null): string {
  if (!formControl || !formControl.errors) return '';

  const errorKeys = Object.keys(formControl.errors);
  const firstErrorKey = errorKeys[0];

  switch (firstErrorKey) {
    case 'required':
      return 'This field is required';

    case 'minlength':
      const minLen = formControl.errors['minlength'].requiredLength;
      return `Minimum length is ${minLen}`;

    case 'maxlength':
      const maxLen = formControl.errors['maxlength'].requiredLength;
      return `Maximum length is ${maxLen}`;

    case 'pattern':
      return 'Invalid format';

    case 'email':
      return 'Invalid email address';

    case 'invalidUrlPattern':
      return 'Invalid URL pattern';

    default:
      return 'Invalid input';
  }
}

export async function decryptObject(contentBase64: string, ivBase64: string, tagBase64: string, keyBase64: string) {
    const enc = (str: string) => Uint8Array.from(atob(str), c => c.charCodeAt(0));

    const iv = enc(ivBase64);
    const tag = enc(tagBase64);
    const content = enc(contentBase64);

    const combined = new Uint8Array(content.length + tag.length);
    combined.set(content);
    combined.set(tag, content.length);

    const keyBuffer = enc(keyBase64);

    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        'AES-GCM',
        false,
        ['decrypt']
    );

    const decrypted = await crypto.subtle.decrypt(
        {
            name: 'AES-GCM', iv, tagLength: 128
        },
        cryptoKey,
        combined,
    )

    return JSON.parse(new TextDecoder().decode(decrypted));
}