import { MapPin, Phone, Mail } from 'lucide-react';
import { CONTACT } from '@/lib/config';
import InfoPage from '@/components/InfoPage';
import ContactForm from '@/components/ContactForm';

export const metadata = { title: 'যোগাযোগ - খেদমতে খালক মিডিয়া' };

export default function Contact() {
  return (
    <InfoPage title="যোগাযোগ" fallback={<p>বই, অর্ডার বা ডেলিভারি নিয়ে যেকোনো প্রশ্নে আমাদের জানান।</p>}>
      <div className="contact-grid">
        <div className="contact-card">
          <p className="ct"><MapPin size={18} /> {CONTACT.address}</p>
          <a className="ct" href={`tel:${CONTACT.phone1.replace(/\s/g, '')}`}><Phone size={18} /> {CONTACT.phone1}</a>
          <a className="ct" href={`tel:${CONTACT.phone2.replace(/\s/g, '')}`}><Phone size={18} /> {CONTACT.phone2}</a>
          <a className="ct" href={`mailto:${CONTACT.email}`}><Mail size={18} /> {CONTACT.email}</a>
        </div>
        <ContactForm />
      </div>
    </InfoPage>
  );
}
