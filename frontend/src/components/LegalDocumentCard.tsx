import type { PolicySection } from "../shared/types";

const LegalDocumentCard = ({ title, content }: PolicySection) => {
  return (
    <section className="mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-1">{title}</h2>
      <p className="text-gray-600 leading-relaxed">{content}</p>
    </section>
  );
};
export default LegalDocumentCard;
