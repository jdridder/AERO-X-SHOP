export interface LegalSection {
  heading?: string;
  body: string[];
}

export interface LegalPage {
  title: string;
  subtitle: string;
  lastUpdated: string;
  sections: LegalSection[];
}

export const legalPages: Record<string, LegalPage> = {
  "legal-notice": {
    title: "Legal Notice",
    subtitle: "Impressum",
    lastUpdated: "2026-02-08",
    sections: [
      {
        heading: "Company Information",
        body: [
          "Wasp Aerodynamics GbR",
          "Address: Am Forsthaus 37c, 46414 Rhede, Germany",
          "Email: lab@waspaero.de",
          "Managing Directors: Jan-David Ridder, Lasse Funck",
        ],
      },
      {
        heading: "Dispute Resolution",
        body: [
          "The European Commission provides a platform for online dispute resolution (ODR): https://ec.europa.eu/consumers/odr",
          "We are neither obligated nor willing to participate in dispute resolution proceedings before a consumer arbitration board.",
        ],
      },
    ],
  },

  "terms-of-service": {
    title: "Terms of Service",
    subtitle: "General Terms & Conditions",
    lastUpdated: "2026-02-08",
    sections: [
      {
        "heading": "Overview",
        "body": ["This website is operated by Wasp Aerodynamics. Throughout the site, the terms “we”, “us” and “our” refer to Wasp Aerodynamics. Wasp Aerodynamics offers this website, including all information, tools and Services available from this site to you, the user, conditioned upon your acceptance of all terms, conditions, policies and notices stated here."],
      },
      {
        "heading": "Acceptance of Terms",
        "body": ["By visiting our site and/ or purchasing something from us, you engage in our “Service” and agree to be bound by the following terms and conditions (“Terms of Service”, “Terms”), including those additional terms and conditions and policies referenced herein and/or available by hyperlink. These Terms of Service apply to all users of the site, including without limitation users who are browsers, vendors, customers, merchants, and/ or contributors of content.",]
      },
      {
        "heading": "User Consent",
        "body": ["Please read these Terms of Service carefully before accessing or using our website. By accessing or using any part of the site, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions of this agreement, then you may not access the website or use any Services. If these Terms of Service are considered an offer, acceptance is expressly limited to these Terms of Service.",]
      },
      {
        "heading": "Modifications to Terms",
        "body": ["Any new features or tools which are added to the current store shall also be subject to the Terms of Service. You can review the most current version of the Terms of Service at any time on this page. We reserve the right to update, change or replace any part of these Terms of Service by posting updates and/or changes to our website. It is your responsibility to check this page periodically for changes. Your continued use of or access to the website following the posting of any changes constitutes acceptance of those changes.",]
      },
      {
        "heading": "SECTION 1 - ONLINE STORE TERMS",
        "body": ["By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence, or that you are the age of majority in your state or province of residence and you have given us your consent to allow any of your minor dependents to use this site. You may not use our products for any illegal or unauthorized purpose nor may you, in the use of the Service, violate any laws in your jurisdiction (including but not limited to copyright laws). You must not transmit any worms or viruses or any code of a destructive nature. A breach or violation of any of the Terms will result in an immediate termination of your Services.",]
      },
      {
        "heading": "SECTION 2 - GENERAL CONDITIONS",
        "body": ["We reserve the right to refuse Service to anyone for any reason at any time. You understand that your content (not including credit card information), may be transferred unencrypted and involve (a) transmissions over various networks; and (b) changes to conform and adapt to technical requirements of connecting networks or devices. Credit card information is always encrypted during transfer over networks. You agree not to reproduce, duplicate, copy, sell, resell or exploit any portion of the Service, use of the Service, or access to the Service or any contact on the website through which the Service is provided, without express written permission by us. The headings used in this agreement are included for convenience only and will not limit or otherwise affect these Terms.",]
      },
      {
        "heading": "SECTION 3 - ACCURACY, COMPLETENESS AND TIMELINESS OF INFORMATION",
        "body": ["We are not responsible if information made available on this site is not accurate, complete or current. The material on this site is provided for general information only and should not be relied upon or used as the sole basis for making decisions without consulting primary, more accurate, more complete or more timely sources of information. Any reliance on the material on this site is at your own risk. This site may contain certain historical information. Historical information, necessarily, is not current and is provided for your reference only. We reserve the right to modify the contents of this site at any time, but we have no obligation to update any information on our site. You agree that it is your responsibility to monitor changes to our site.",]
      },
      {
        "heading": "SECTION 4 - MODIFICATIONS TO THE SERVICE AND PRICES",
        "body": ["Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time. We shall not be liable to you or to any third-party for any modification, price change, suspension or discontinuance of the Service."]
      },
      {
        "heading": "SECTION 5 - PRODUCTS OR SERVICES (if applicable)",
        "body": ["Certain products or Services may be available exclusively online through the website. These products or Services may have limited quantities and are subject to return or exchange only according to our Refund Policy. We have made every effort to display as accurately as possible the colors and images of our products that appear at the store. We cannot guarantee that your computer monitor's display of any color will be accurate. We reserve the right, but are not obligated, to limit the sales of our products or Services to any person, geographic region or jurisdiction. We may exercise this right on a case-by-case basis. We reserve the right to limit the quantities of any products or Services that we offer. All descriptions of products or product pricing are subject to change at anytime without notice, at the sole discretion of us. We reserve the right to discontinue any product at any time. Any offer for any product or Service made on this site is void where prohibited. We do not warrant that the quality of any products, Services, information, or other material purchased or obtained by you will meet your expectations, or that any errors in the Service will be corrected.",]
      },
      {
        "heading": "SECTION 6 - ACCURACY OF BILLING AND ACCOUNT INFORMATION",
        "body": ["We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household or per order. These restrictions may include orders placed by or under the same customer account, the same credit card, and/or orders that use the same billing and/or shipping address. In the event that we make a change to or cancel an order, we may attempt to notify you by contacting the e‑mail and/or billing address/phone number provided at the time the order was made. We reserve the right to limit or prohibit orders that, in our sole judgment, appear to be placed by dealers, resellers or distributors. You agree to provide current, complete and accurate purchase and account information for all purchases made at our store. You agree to promptly update your account and other information, including your email address and credit card numbers and expiration dates, so that we can complete your transactions and contact you as needed.",]
      },
      {
        "heading": "SECTION 7 - OPTIONAL TOOLS",
        "body": ["We may provide you with access to third-party tools over which we neither monitor nor have any control nor input. You acknowledge and agree that we provide access to such tools ”as is” and “as available” without any warranties, representations or conditions of any kind and without any endorsement. We shall have no liability whatsoever arising from or relating to your use of optional third-party tools. Any use by you of the optional tools offered through the site is entirely at your own risk and discretion and you should ensure that you are familiar with and approve of the terms on which tools are provided by the relevant third-party provider(s). We may also, in the future, offer new Services and/or features through the website (including the release of new tools and resources). Such new features and/or Services shall also be subject to these Terms of Service.",]
      },
      {
        "heading": "SECTION 8 - THIRD-PARTY LINKS",
        "body": ["Certain content, products and Services available via our Service may include materials from third-parties. Third-party links on this site may direct you to third-party websites that are not affiliated with us. We are not responsible for examining or evaluating the content or accuracy and we do not warrant and will not have any liability or responsibility for any third-party materials or websites, or for any other materials, products, or Services of third-parties. We are not liable for any harm or damages related to the purchase or use of goods, Services, resources, content, or any other transactions made in connection with any third-party websites. Please review carefully the third-party's policies and practices and make sure you understand them before you engage in any transaction. Complaints, claims, concerns, or questions regarding third-party products should be directed to the third-party.",]
      },
      {
        "heading": "SECTION 9 - USER COMMENTS, FEEDBACK AND OTHER SUBMISSIONS",
        "body": ["If, at our request, you send certain specific submissions (for example contest entries) or without a request from us, you send creative ideas, suggestions, proposals, plans, or other materials, whether online, by email, by postal mail, or otherwise (collectively, 'comments'), you agree that we may, at any time, without restriction, edit, copy, publish, distribute, translate and otherwise use in any medium any comments that you forward to us. We are and shall be under no obligation (1) to maintain any comments in confidence; (2) to pay compensation for any comments; or (3) to respond to any comments. We may, but have no obligation to, monitor, edit or remove content that we determine in our sole discretion to be unlawful, offensive, threatening, libelous, defamatory, pornographic, obscene or otherwise objectionable or violates any party’s intellectual property or these Terms of Service. You agree that your comments will not violate any right of any third-party, including copyright, trademark, privacy, personality or other personal or proprietary right. You further agree that your comments will not contain libelous or otherwise unlawful, abusive or obscene material, or contain any computer virus or other malware that could in any way affect the operation of the Service or any related website. You may not use a false e‑mail address, pretend to be someone other than yourself, or otherwise mislead us or third-parties as to the origin of any comments. You are solely responsible for any comments you make and their accuracy. We take no responsibility and assume no liability for any comments posted by you or any third-party.",]
      },
      {
        "heading": "SECTION 10 - PERSONAL INFORMATION",
        "body": ["Your submission of personal information through the store is governed by our Privacy Policy, which can be viewed here."]
      },
      {
        "heading": "SECTION 11 - ERRORS, INACCURACIES AND OMISSIONS",
        "body": ["Occasionally there may be information on our site or in the Service that contains typographical errors, inaccuracies or omissions that may relate to product descriptions, pricing, promotions, offers, product shipping charges, transit times and availability. We reserve the right to correct any errors, inaccuracies or omissions, and to change or update information or cancel orders if any information in the Service or on any related website is inaccurate at any time without prior notice (including after you have submitted your order). We undertake no obligation to update, amend or clarify information in the Service or on any related website, including without limitation, pricing information, except as required by law. No specified update or refresh date applied in the Service or on any related website, should be taken to indicate that all information in the Service or on any related website has been modified or updated."]
      },
      {
        "heading": "SECTION 12 - PROHIBITED USES",
        "body": ["In addition to other prohibitions as set forth in the Terms of Service, you are prohibited from using the site or its content: (a) for any unlawful purpose; (b) to solicit others to perform or participate in any unlawful acts; (c) to violate any international, federal, provincial or state regulations, rules, laws, or local ordinances; (d) to infringe upon or violate our intellectual property rights or the intellectual property rights of others; (e) to harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate based on gender, sexual orientation, religion, ethnicity, race, age, national origin, or disability; (f) to submit false or misleading information; (g) to upload or transmit viruses or any other type of malicious code that will or may be used in any way that will affect the functionality or operation of the Service or of any related website, other websites, or the Internet; (h) to collect or track the personal information of others; (i) to spam, phish, pharm, pretext, spider, crawl, or scrape; (j) for any obscene or immoral purpose; or (k) to interfere with or circumvent the security features of the Service or any related website, other websites, or the Internet. We reserve the right to terminate your use of the Service or any related website for violating any of the prohibited uses."]
      },
      {
        "heading": "SECTION 13 - DISCLAIMER OF WARRANTIES; LIMITATION OF LIABILITY",
        "body": ["We do not guarantee, represent or warrant that your use of our Service will be uninterrupted, timely, secure or error-free. We do not warrant that the results that may be obtained from the use of the Service will be accurate or reliable. You agree that from time to time we may remove the Service for indefinite periods of time or cancel the Service at any time, without notice to you. You expressly agree that your use of, or inability to use, the Service is at your sole risk. The Service and all products and Services delivered to you through the Service are (except as expressly stated by us) provided 'as is' and 'as available' for your use, without any representation, warranties or conditions of any kind, either express or implied, including all implied warranties or conditions of merchantability, merchantable quality, fitness for a particular purpose, durability, title, and non-infringement. In no case shall Wasp Aerodynamics, our directors, officers, employees, affiliates, agents, contractors, interns, suppliers, Service providers or licensors be liable for any injury, loss, claim, or any direct, indirect, incidental, punitive, special, or consequential damages of any kind, including, without limitation lost profits, lost revenue, lost savings, loss of data, replacement costs, or any similar damages, whether based in contract, tort (including negligence), strict liability or otherwise, arising from your use of any of the Service or any products procured using the Service, or for any other claim related in any way to your use of the Service or any product, including, but not limited to, any errors or omissions in any content, or any loss or damage of any kind incurred as a result of the use of the Service or any content (or product) posted, transmitted, or otherwise made available via the Service, even if advised of their possibility. Because some states or jurisdictions do not allow the exclusion or the limitation of liability for consequential or incidental damages, in such states or jurisdictions, our liability shall be limited to the maximum extent permitted by law."]
      },
      {
        "heading": "SECTION 14 - INDEMNIFICATION",
        "body": ["You agree to indemnify, defend and hold harmless Wasp Aerodynamics and our parent, subsidiaries, affiliates, partners, officers, directors, agents, contractors, licensors, Service providers, subcontractors, suppliers, interns and employees, harmless from any claim or demand, including reasonable attorneys’ fees, made by any third-party due to or arising out of your breach of these Terms of Service or the documents they incorporate by reference, or your violation of any law or the rights of a third-party."]
      },
      {
        "heading": "SECTION 15 - SEVERABILITY",
        "body": ["In the event that any provision of these Terms of Service is determined to be unlawful, void or unenforceable, such provision shall nonetheless be enforceable to the fullest extent permitted by applicable law, and the unenforceable portion shall be deemed to be severed from these Terms of Service, such determination shall not affect the validity and enforceability of any other remaining provisions."]
      },
      {
        "heading": "SECTION 16 - TERMINATION",
        "body": ["The obligations and liabilities of the parties incurred prior to the termination date shall survive the termination of this agreement for all purposes. These Terms of Service are effective unless and until terminated by either you or us. You may terminate these Terms of Service at any time by notifying us that you no longer wish to use our Services, or when you cease using our site. If in our sole judgment you fail, or we suspect that you have failed, to comply with any term or provision of these Terms of Service, we also may terminate this agreement at any time without notice and you will remain liable for all amounts due up to and including the date of termination; and/or accordingly may deny you access to our Services (or any part thereof)."]
      },
      {
        "heading": "SECTION 17 - ENTIRE AGREEMENT",
        "body": ["The failure of us to exercise or enforce any right or provision of these Terms of Service shall not constitute a waiver of such right or provision. These Terms of Service and any policies or operating rules posted by us on this site or in respect to the Service constitutes the entire agreement and understanding between you and us and governs your use of the Service, superseding any prior or contemporaneous agreements, communications and proposals, whether oral or written, between you and us (including, but not limited to, any prior versions of the Terms of Service). Any ambiguities in the interpretation of these Terms of Service shall not be construed against the drafting party."]
      },
      {
        "heading": "SECTION 18 - GOVERNING LAW",
        "body": ["These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of Germany."]
      },
      {
        "heading": "SECTION 19 - CHANGES TO TERMS OF SERVICE",
        "body": ["You can review the most current version of the Terms of Service at any time at this page. We reserve the right, at our sole discretion, to update, change or replace any part of these Terms of Service by posting updates and changes to our website. It is your responsibility to check our website periodically for changes. Your continued use of or access to our website or the Service following the posting of any changes to these Terms of Service constitutes acceptance of those changes."]
      },
    ]
  },

  shipping: {
    title: "Shipping and Return",
    subtitle: "Delivery Information",
    lastUpdated: "2026-02-09",
    sections: [
      {
        heading: "Shipping Zones & Delivery Times",
        body: [
          "Germany: 2–4 business days",
          "EU (Austria, France, Netherlands, etc.): 3–7 business days",
          "International (US, UK, etc.): 7–14 business days",
        ],
      },
      {
        heading: "Shipping Costs",
        body: [
          "Germany: €4.90 (free shipping on orders over €80)",
          "EU: €9.90 (free shipping on orders over €120)",
          "International: calculated at checkout",
        ],
      },
      {
        heading: "Carriers",
        body: [
          "We ship with DHL and DPD. Tracking information is provided via email once your order has been dispatched.",
        ],
      },
      {
        heading: "Customs & Duties",
        body: [
          "For deliveries outside the EU, customs duties and import taxes may apply. These are the responsibility of the recipient.",
        ],
      },
      {
        "heading": "Returns Window",
        "body": [
          "Wasp Aerodynamics provides a 30-day return window for all eligible products.",
          "You have exactly 30 days from the date of delivery to initiate a return request."
        ]
      },
      {
        "heading": "Eligibility Criteria",
        "body": [
          "To qualify for a return, the item must remain in the exact condition in which it was received.",
          "Apparel must be unworn, unused, and still possess all original tags and packaging.",
          "A valid receipt or official proof of purchase is mandatory to verify the transaction."
        ]
      },
      {
        "heading": "Return Logistics",
        "body": [
          "To initiate the return process, please login into your account and click the 'return' button for the specific order, that you want to return.",
          "A seal will be provided automatically to your email.",
          "Once approved, items should be dispatched to our processing center: Am Forsthaus 37c, 46414 Rhede, Germany."
        ]
      },
      {
        "heading": "Shipping Recommendations",
        "body": [
          "For standard returns under 500g, we recommend utilizing the Deutsche Post 'Großbrief' for maximum efficiency.",
          "For any technical questions regarding the return of your shipment, reach out to us at lab@waspaero.de."
        ]
      },
      {
        "heading": "Damages & Discrepancies",
        "body": [
          "We urge you to inspect your order immediately upon reception.",
          "In the event of a defective, damaged, or incorrect delivery, please contact us instantly so we can evaluate the discrepancy and rectify the issue."
        ]
      },
      {
        "heading": "Non-Returnable Items",
        "body": [
          "Certain goods are exempt from our return policy, including perishable items, custom-engineered products, and personalized gear.",
          "We are unable to accept returns for hazardous materials, flammable liquids, gases, or personal care products.",
          "Please note that all sale items and gift cards are considered final sale and cannot be returned."
        ]
      },
      {
        "heading": "Exchanges",
        "body": [
          "The most streamlined method for an exchange is to return the original item for a refund.",
          "Once your return is validated and accepted, you may proceed with a separate purchase for the new item."
        ]
      },
      {
        "heading": "EU Right of Withdrawal (Cooling-Off Period)",
        "body": [
          "For orders shipped within the European Union, you maintain a legal right to cancel or return your purchase within 14 days for any reason, without justification.",
          "The standard requirements for item condition (unworn, original packaging, tags) and proof of purchase remain applicable for these returns."
        ]
      },
      {
        "heading": "Refund Processing",
        "body": [
          "We will notify you via email once your return has been received and inspected to confirm the status of your refund.",
          "Approved refunds are automatically processed to the original payment method within 10 business days.",
          "Please keep in mind that individual banks and credit card providers may require additional processing time to post the credit.",
          "If more than 15 business days have elapsed since your refund approval, please contact us at lab@waspaero.de for assistance."
        ]
      },
    ],
  },

  "data-protection": {
    title: "Data Protection",
    subtitle: "Privacy Policy",
    lastUpdated: "2026-02-09",
    sections: [
      {
        "heading": "Introduction & Scope",
        "body": [
          "Wasp Aerodynamics operates this platform to provide a premium, curated shopping experience. This Privacy Policy outlines our practices regarding the collection, use, and disclosure of your personal information when you interact with our services, communicate with us, or make a purchase.",
        ]
      },
      {
        "heading": "Defining Personal Information",
        "body": [
          "For the purposes of this policy, 'personal information' refers to data that identifies or can be reasonably linked to you. This does not include anonymized or de-identified data that cannot be traced back to an individual.",
          "Depending on your interaction with Wasp Aerodynamics, we may process various categories of data, including contact details, financial information, account credentials, and transaction history.",
          "We also collect technical data such as your IP address, browser type, and interaction patterns to optimize your experience."
        ]
      },
      {
        "heading": "Sources of Data Collection",
        "body": [
          "We collect information directly from you when you create an account, complete a purchase, or reach out to our support team.",
          "Data is also gathered automatically through cookies and similar tracking technologies as you navigate our digital environment.",
          "Finally, we may receive information from our service providers, business partners, and other third-party integrations."
        ]
      },
      {
        "heading": "How We Utilize Your Information",
        "body": [
          "Service Provision: We use your data to fulfill orders, process payments, manage your account, and arrange logistics for shipping and returns.",
          "Customization: Your information allows us to tailor the shopping experience, providing personalized product recommendations and remembering your preferences.",
          "Marketing: With your consent, we use your data to provide promotional updates via email or text and to display relevant advertisements across various platforms.",
          "Security: To ensure a safe environment, we monitor for fraudulent activity, investigate potential threats, and secure our payment gateways.",
          "Legal Compliance: We process information to meet legal obligations, respond to law enforcement requests, and protect our intellectual property."
        ]
      },
      {
        "heading": "Information Disclosure",
        "body": [
          "We share data with other vendors who facilitate IT management, analytics, and shipping logistics on our behalf.",
          "Business and marketing partners may receive information to assist with targeted advertising. You have the right to opt-out of these specific data-sharing practices at any time.",
          "In the event of a business merger, bankruptcy, or legal discovery process, we may disclose information as required to defend our rights or comply with judicial mandates."
        ]
      },
      {
        "heading": "Third-Party Integrations",
        "body": [
          "Our services may feature links to external platforms or social media widgets. We do not control the privacy practices of these third parties.",
          "We recommend reviewing the specific privacy notices of any external site you visit through our platform, as we are not responsible for their data security or content accuracy."
        ]
      },
      {
        "heading": "Youth Privacy",
        "body": [
          "The Wasp Aerodynamics experience is not intended for minors. We do not knowingly collect information from children under the age of majority.",
          "If you are a parent or guardian and believe your child has provided us with personal data, please contact us immediately to request its deletion."
        ]
      },
      {
        "heading": "Security & Data Retention",
        "body": [
          "While we implement robust security protocols, no digital transmission is entirely impenetrable. We advise against sending sensitive details through unencrypted channels.",
          "We retain your data only as long as necessary to maintain your account, fulfill our service obligations, resolve disputes, or satisfy legal requirements."
        ]
      },
      {
        "heading": "Your Rights & Global Choices",
        "body": [
          "Depending on your jurisdiction, you may have the right to access, delete, or correct the personal information we hold.",
          "You may also request a portable copy of your data or opt-out of the sale or sharing of your information for targeted advertising.",
          "We honor Global Privacy Control (GPC) signals. If your browser has this enabled, we will automatically treat it as a request to opt-out of tracking on that device."
        ]
      },
      {
        "heading": "Regional Provisions (EEA & UK)",
        "body": [
          "Residents of the UK and European Economic Area have additional protections, including the right to object to processing and the right to withdraw consent at any time.",
          "We utilize recognized transfer mechanisms, such as Standard Contractual Clauses, when moving data outside the EEA or UK.",
          "You have the right to lodge a formal complaint with your local data protection authority if you are unsatisfied with how we handle your information."
        ]
      },
      {
        "heading": "Policy Updates",
        "body": [
          "Wasp Aerodynamics may update this Privacy Policy periodically to reflect operational changes or new regulatory requirements.",
          "Any revisions will be posted here with an updated 'Last Updated' timestamp. We encourage you to review this page regularly."
        ]
      },
    ],
  },
};

export const legalSlugs = Object.keys(legalPages);
