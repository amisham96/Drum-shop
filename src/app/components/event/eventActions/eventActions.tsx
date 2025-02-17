'use client';

import styles from './eventActions.module.css';
import toast from 'react-hot-toast';

type PropsType = {
  socialLinks: {
    instagram: string,
    facebook: string,
    youtube: string,
    x: string,
  }
};

function EventActions({ socialLinks } : PropsType) {
  // function to copy link to the clipboard
  async function shareLink() {
    try {
      if (!socialLinks) throw new Error('No links provided');

      const allLinks = Object.values(socialLinks);
      if (allLinks.length == 0) throw new Error('No links provided');

      const firstLink = allLinks[0];
      await navigator.clipboard.writeText(firstLink);
      toast.success('Copied a social link to clipboard')
    } catch (error: any) {
      toast.error(error.message || 'Error copying url');
    }    
  }

  return (
    <div className={styles.event_actions}>
      <button onClick={() => shareLink()}>Copy URL</button>
    </div>
  );
}

export default EventActions