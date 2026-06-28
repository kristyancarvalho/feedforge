export class CrawlerLock {
  private active = false;

  tryAcquire(): boolean {
    if (this.active) {
      return false;
    }
    this.active = true;
    return true;
  }

  release(): void {
    this.active = false;
  }

  isActive(): boolean {
    return this.active;
  }
}

export const crawlerLock = new CrawlerLock();
