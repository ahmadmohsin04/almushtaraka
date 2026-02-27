import './Contact.css';

const offices = [
  {
    region: 'Pakistan',
    flag: '🇵🇰',
    locations: [
      {
        type: 'OFFICE',
        icon: '🏢',
        details: [
          '41-B, 1st Floor, Gohar Centre',
          'Wahdat Road, Lahore',
          'Pakistan',
        ],
        contacts: [
          { label: 'TEL', value: '+92 321 471 7074', href: 'tel:+923214717074' },
          { label: 'TEL', value: '+92 322 479 5177', href: 'tel:+923224795177' },
          { label: 'EMAIL', value: 'malikarifmukhtar@gmail.com', href: 'mailto:malikarifmukhtar@gmail.com' },
        ],
      },
      {
        type: 'FACTORY',
        icon: '🏭',
        details: [
          'Plot #01 & 02, China Warehouse',
          'Near Karol Ghatti, G.T Road',
          'Lahore, Pakistan',
        ],
        contacts: [
          { label: 'TEL', value: '+92 321 848 5191', href: 'tel:+923218485191' },
          { label: 'EMAIL', value: 'arif267@hotmail.com', href: 'mailto:arif267@hotmail.com' },
        ],
      },
    ],
  },
  {
    region: 'United Arab Emirates',
    flag: '🇦🇪',
    locations: [
      {
        type: 'OFFICE',
        icon: '🏢',
        details: [
          'Al Mushtaraka Trading Company',
          'Plot #1616064, Dibba Industrial Area',
          'Dibba – Fujairah, U.A.E.',
        ],
        contacts: [
          { label: 'TEL', value: '+971 55 326 0061', href: 'tel:+971553260061' },
          { label: 'EMAIL', value: 'amtcdibba@gmail.com', href: 'mailto:amtcdibba@gmail.com' },
        ],
      },
    ],
  },
  {
    region: 'South Korea',
    flag: '🇰🇷',
    locations: [
      {
        type: 'OFFICE',
        icon: '🏢',
        details: [
          'Confidenko Co., Ltd.',
          '59-2 Dongheon-ro 3beon-gil, Deogyang-gu',
          'Goyang-si, Gyeonggi-do',
          'Republic of Korea',
        ],
        contacts: [
          { label: 'TEL', value: '+82 10 6693 0522', href: 'tel:+821066930522' },
          { label: 'TEL', value: '+92 321 848 5191', href: 'tel:+923218485191' },
          { label: 'EMAIL', value: 'dhkeith@naver.com', href: 'mailto:dhkeith@naver.com' },
        ],
      },
    ],
  },
];

function Contact() {
  return (
    <div className="contact-page">

      {/* Hero */}
      <div className="contact-hero">
        <div className="contact-hero-content">
          <div className="contact-tag">GET IN TOUCH</div>
          <h1>CONTACT US</h1>
          <p>We operate across three continents. Reach out to the office nearest to you.</p>
        </div>
      </div>

      {/* Offices */}
      <div className="contact-body">
        {offices.map((office, i) => (
          <div className="region-block" key={i}>
            <div className="region-header">
              <span className="region-flag">{office.flag}</span>
              <h2>{office.region}</h2>
            </div>
            <div className="locations-grid">
              {office.locations.map((loc, j) => (
                <div className="location-card" key={j}>
                  <div className="location-type">
                    <span className="location-icon">{loc.icon}</span>
                    <span>{loc.type}</span>
                  </div>
                  <div className="location-address">
                    {loc.details.map((line, k) => (
                      <p key={k}>{line}</p>
                    ))}
                  </div>
                  <div className="location-contacts">
                    {loc.contacts.map((c, k) => (
                      <a key={k} href={c.href} className="contact-item">
                        <span className="contact-label">{c.label}</span>
                        <span className="contact-value">{c.value}</span>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default Contact;