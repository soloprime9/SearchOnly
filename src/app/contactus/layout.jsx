export const metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the FondPeace team. Reach out for support, inquiries, feedback, or business collaborations.",
  alternates: {
    canonical: "https://www.fondpeace.com/contactus",
  },
  openGraph: {
    title: "Contact Us | FondPeace",
    description:
      "Get in touch with the FondPeace team for support, inquiries, or feedback.",
    url: "https://www.fondpeace.com/contactus",
    siteName: "FondPeace",
    type: "website",
  },
};

export default function ContactLayout({ children }) {
  return <>{children}</>;
}
