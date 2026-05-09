import PolicySectionCart from "../components/PolicySectionCart";
import { Policies } from "../config/privacyData";

const PrivacyPolicy = () => {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex flex-col items-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mt-1">Last updated: May 9, 2026</p>
      </div>
      <hr className="mb-8 border-gray-200" />

      {Policies.map((section) => (
        <PolicySectionCart
          key={section.id}
          id={section.id}
          title={section.title}
          content={section.content}
        />
      ))}
    </div>
  );
};

export default PrivacyPolicy;
