/**
 * User model representing an authenticated user
*/

export interface User {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;

    // CA2 - create new ads
    isAdmin?: boolean;

    createdAt?: string;
    lastLogin?: string;
}