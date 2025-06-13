import Sidebar from "@/components/dashoboadpropertyowner/sidebar";
import PropertyTable from "@/components/dashoboadpropertyowner/propertytable";

export default function PropertyPage() {
  return (
    <Sidebar>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Property Listing</h1>
        </div>

        <PropertyTable />
      </div>
    </Sidebar>
  );
}
