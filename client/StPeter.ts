import { Subject, filter, map, startWith } from "rxjs";

export const spTokenName = 'sp-access-token';

export type User = {
    id: string;
    name: string;
    claims: any;
    [key: string]: any;
}

type LoginRequest = {
    email: string;
    password: string;
}

type RefreshRequest = {
    accessToken: string;
    refreshToken: string;
}

type ResetRequest = {
    email: string;
}

type RegisterRequest = {
    email: string;
    password: string;
    name: string;
}

type VerifyRequest = {
    accessToken: string;
}

type AuthResponse = {
    access_token: string;
    refresh_token: string;
}

type CustomBodyInit = BodyInit | LoginRequest | RegisterRequest | RefreshRequest | ResetRequest | VerifyRequest | null;

interface iRequestInit extends Omit<RequestInit, 'body'> {
    body?: CustomBodyInit;
}

type StPeterOptions = {
    /**
     * api endpoint
     */
    apiUrl?: string;

    /**
     * The interval at which the token should be refreshed.
     * Default is 30 minutes.
     * false to disable token refresh.
     */
    tokenRefreshInterval?: number | false;

}



export class StPeter {

    private static _instance: StPeter;
    public static readonly authStateChange = new Subject<User | null | 'SIGNED_OUT'>();

    private _refreshTimeout?: number;
    private storageEvents$ = new Subject<any>();
    private _options: StPeterOptions = {
        apiUrl: '/api/auth/v1',
        // tokenRefreshInterval: 30 * 60 * 1000
        tokenRefreshInterval: 1 * 60 * 1000
    }

    public static get instance(): StPeter {
        return new StPeter();
    }

    constructor(options: StPeterOptions = {}) {
        if (StPeter._instance) {
            return StPeter._instance;
        }
        StPeter._instance = this;
        this._options = { ...this._options, ...options };
        this.startRefreshTokenTimer();
        this.watchStorageItem(spTokenName).subscribe((x:any) => {
            StPeter.authStateChange.next(this.getUser(x));
        });

        this.verify();
    }


    async verify() {
        const accessToken = this.getStorageItem(spTokenName);
        if (!accessToken) return;
        try {
            const response = await this.fetch('verify', { body: { accessToken } });
            if (!response.error) return;
            this.logout();
        } catch (e) {
            console.error(e)
        }

    }


    private getUser(accessToken: string): User | null {
        try {
            const payload = accessToken.split('.')[1];
            const tokenText = atob(payload);
            const parsed = JSON.parse(tokenText);
            parsed.token = accessToken;
            return parsed;
        } catch (e) {
            return null;
        }
    }


    private async fetch(url: string, options?: iRequestInit) {
        const _options = {
            method: options?.method || 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
           ...options
        } as RequestInit;
        if(_options.body){
            _options.body = JSON.stringify(_options.body);
        }

        try {
            const response = await fetch(`${this._options.apiUrl}/${url}`, _options)
            return await response.json();
        }
        catch (e) {
            console.error(e);
        }
    }


    async login(email: string, password: string) {
        password = await this.sha256(password);
        const data = await this.fetch(`login`, { body: { email, password } });
        if (data.error) {
            throw new Error(data.error);
        }
        const { access_token } = data;
        this.setStorageItem(spTokenName, access_token);
        this.setCookie(spTokenName, access_token);
        return data;
    }


    async register(email: string, password: string, name: string) {
        password = await this.sha256(password);
        const data = await this.fetch('register', { body: { email, password, name } });
        if (data.error) {
            console.error(data.error);
            return;
        }
        const { access_token } = data;
        this.setStorageItem(spTokenName, access_token);
        return data;
    }

    async reset(email: string) {
        const data = await this.fetch('reset', { body: { email } });
        if (data.error) {
            console.error(data.error);
            return;
        }
        return data;
    }



    logout() {
        this.removeStorageItem(spTokenName);
        this.removeCookie(spTokenName);
        window.location.reload();
    }

    async refresh() {
        try {
            const accessToken = this.getStorageItem(spTokenName);
            if (!accessToken) return;
            const data = await this.fetch('refresh', { method: 'GET' });
            if (data.error){
                return this.logout();
            }
            const { access_token } = data;
            this.setStorageItem(spTokenName, access_token);

        } catch (e) {
            console.error(e);
        }
    }

    setCookie(name: string, value: string, days = 1) {
        document.cookie = `${name}=${value};path=/`;
    }

    removeCookie(name: string) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }

    setStorageItem(key: string, value: any, emit = true) {
        try {
            localStorage.setItem(key, value);
            if (emit) this.storageEvents$.next({ key, value })
        } catch (e) {
            console.warn('Local storage not available');
        }
    }


    private getStorageItem(key: string) {
        try {
            const storredValue = localStorage.getItem(key)
            return storredValue ? storredValue : undefined;
        } catch (e) {
            console.warn('Local storage not available')
        }
        return undefined;
    }

    private removeStorageItem(key: string, emit = true) {
        try {
            localStorage.removeItem(key);
            if (emit) {
                this.storageEvents$.next({ key })
            }
        } catch (e) {
            console.warn('Local storage not available');
        }
    }

    private watchStorageItem(key: string) {
        const currentValue = this.getStorageItem(key)
        return this.storageEvents$.pipe(
            filter((x: any) => {
                return x?.key == key
            }),
            map((x:any) => x.value),
            startWith(currentValue)
        )
    }

    private startRefreshTokenTimer() {
        if (!this._options.tokenRefreshInterval) return;
        clearInterval(this._refreshTimeout);
        this._refreshTimeout = setInterval(() => this.refresh(), this._options.tokenRefreshInterval) as unknown as number
    }

    private async sha256(message: string) {
        if (!crypto?.subtle) {
            console.warn('crypto.subtle is not available, using plain text as hash. This is not secure!!!!!!!');
            return message;
        }
        const encoder = new TextEncoder();
        const data = encoder.encode(message);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

}