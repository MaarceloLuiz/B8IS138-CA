import { Injectable } from '@angular/core';
import { 
  Auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
  authState,
  updateProfile
} from '@angular/fire/auth';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models';

/**
 * auth service
 * handles Firebase authentication and user management
*/
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  public authState$: Observable<FirebaseUser | null>;

  constructor(private auth: Auth) {
    this.authState$ = authState(this.auth);
    
    // Subscribe to auth state changes
    this.authState$.subscribe(firebaseUser => {
      if (firebaseUser) {
        const user: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName || undefined,
          photoURL: firebaseUser.photoURL || undefined,
          isAdmin: false, // default to false, can be set from Firestore in CA Two
        };
        this.currentUserSubject.next(user);
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  get currentUserId(): string | null {
    return this.auth.currentUser?.uid || null;
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return this.auth.currentUser !== null;
  }

  async login(email: string, password: string): Promise<User> {
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      const user: User = {
        uid: credential.user.uid,
        email: credential.user.email!,
        displayName: credential.user.displayName || undefined,
        photoURL: credential.user.photoURL || undefined,
        lastLogin: new Date().toISOString(),
      };
      return user;
    } catch (error: any) {
      console.error('Login error:', error);
      throw this.handleAuthError(error);
    }
  }

  async register(email: string, password: string, displayName?: string): Promise<User> {
    try {
      const credential = await createUserWithEmailAndPassword(this.auth, email, password);
      
      if (displayName && credential.user) {
        await updateProfile(credential.user, { displayName });
      }

      const user: User = {
        uid: credential.user.uid,
        email: credential.user.email!,
        displayName: displayName,
        createdAt: new Date().toISOString(),
      };
      
      return user;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw this.handleAuthError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.currentUserSubject.next(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

    // firebase auth errors handling
  private handleAuthError(error: any): Error {
    let message = 'An error occurred during authentication';
    
    switch (error.code) {
      case 'auth/user-not-found':
        message = 'No user found with this email';
        break;
      case 'auth/wrong-password':
        message = 'Incorrect password';
        break;
      case 'auth/email-already-in-use':
        message = 'Email is already registered';
        break;
      case 'auth/weak-password':
        message = 'Password should be at least 6 characters';
        break;
      case 'auth/invalid-email':
        message = 'Invalid email address';
        break;
      case 'auth/too-many-requests':
        message = 'Too many failed attempts. Please try again later';
        break;
      case 'auth/network-request-failed':
        message = 'Network error. Please check your connection';
        break;
    }
    
    return new Error(message);
  }

  async updateUserProfile(displayName?: string, photoURL?: string): Promise<void> {
    if (this.auth.currentUser) {
      await updateProfile(this.auth.currentUser, { displayName, photoURL });
      
      // Force refresh the current user state
      const firebaseUser = this.auth.currentUser;
      if (firebaseUser) {
        const user: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName || undefined,
          photoURL: firebaseUser.photoURL || undefined,
          isAdmin: this.currentUserSubject.value?.isAdmin || false,
        };
        this.currentUserSubject.next(user);
      }
    }
  }
}