import type { Pinpoint, Post, PostType } from '../types';

class PinpointService {
  private readonly STORAGE_KEY = 'waterway_pinpoints';

  /**
   * Get all pinpoints from localStorage
   */
  getAllPinpoints(): Pinpoint[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading pinpoints:', error);
      return [];
    }
  }

  /**
   * Save pinpoints to localStorage
   */
  private savePinpoints(pinpoints: Pinpoint[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(pinpoints));
    } catch (error) {
      console.error('Error saving pinpoints:', error);
    }
  }

  /**
   * Create a new pinpoint
   * @deprecated Use createPinpointWithPost instead. Pinpoints should not be created without posts.
   */
  createPinpoint(): Pinpoint {
    // Business rule: No empty pinpoints allowed
    throw new Error('Pinpoints cannot be created without posts. Use createPinpointWithPost instead.');
  }

  /**
   * Create a new pinpoint with a required initial post
   */
  createPinpointWithPost(
    latitude: number, 
    longitude: number, 
    postData: { type: PostType; title: string; description: string }
  ): Pinpoint {
    // Business rule: first post cannot be cleaning type
    if (postData.type === 'cleaning') {
      throw new Error('The first post in a pinpoint cannot be a cleaning post. Please select Alert or Both.');
    }

    // Create the initial post
    const initialPost: Post = {
      id: this.generateId(),
      type: postData.type,
      title: postData.title,
      description: postData.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Create the pinpoint with the initial post
    const newPinpoint: Pinpoint = {
      id: this.generateId(),
      latitude,
      longitude,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      posts: [initialPost],
      photos: []
    };

    const pinpoints = this.getAllPinpoints();
    pinpoints.push(newPinpoint);
    this.savePinpoints(pinpoints);

    return newPinpoint;
  }

  /**
   * Add a post to a pinpoint
   */
  addPostToPinpoint(pinpointId: string, postData: { type: PostType; title: string; description: string }): Post | null {
    const pinpoints = this.getAllPinpoints();
    const pinpoint = pinpoints.find(p => p.id === pinpointId);
    
    if (!pinpoint) return null;

    // Business rule: cleaning posts can only be created if there's already an alert or both post
    if (postData.type === 'cleaning') {
      const hasAlertOrBoth = pinpoint.posts.some(post => 
        post.type === 'alert' || post.type === 'both'
      );
      
      if (!hasAlertOrBoth) {
        throw new Error('A cleaning post can only be created after there is already an alert or both post in this pinpoint.');
      }
    }

    const newPost: Post = {
      id: this.generateId(),
      type: postData.type,
      title: postData.title,
      description: postData.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    pinpoint.posts.push(newPost);
    pinpoint.updatedAt = new Date().toISOString();
    this.savePinpoints(pinpoints);

    return newPost;
  }

  /**
   * Delete a pinpoint
   */
  deletePinpoint(pinpointId: string): boolean {
    const pinpoints = this.getAllPinpoints();
    const filteredPinpoints = pinpoints.filter(p => p.id !== pinpointId);
    
    if (filteredPinpoints.length === pinpoints.length) {
      return false; // Pinpoint not found
    }

    this.savePinpoints(filteredPinpoints);
    return true;
  }

  /**
   * Update a pinpoint
   */
  updatePinpoint(pinpointId: string, updates: Partial<Pinpoint>): Pinpoint | null {
    const pinpoints = this.getAllPinpoints();
    const pinpointIndex = pinpoints.findIndex(p => p.id === pinpointId);
    
    if (pinpointIndex === -1) return null;

    pinpoints[pinpointIndex] = {
      ...pinpoints[pinpointIndex],
      ...updates,
      id: pinpointId, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };

    this.savePinpoints(pinpoints);
    return pinpoints[pinpointIndex];
  }

  /**
   * Get a specific pinpoint by ID
   */
  getPinpointById(pinpointId: string): Pinpoint | null {
    const pinpoints = this.getAllPinpoints();
    return pinpoints.find(p => p.id === pinpointId) || null;
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export const pinpointService = new PinpointService();