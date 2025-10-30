/**
 * User model representing an authenticated user
*/

export interface User {
    userId: string;
    email: string;
    displayName?: string;
    photoURL?: string;

    // CA2 - create new ads
    isAdmin?: boolean;

    createdAt: string;
    lastLogin?: string;
}