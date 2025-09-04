import AdminTripForm from "@/components/admin/AdminTripForm";

export default function AdminTripNew() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Nowa wycieczka</h2>
        <p className="text-muted-foreground">Dodaj nową wycieczkę do oferty.</p>
      </div>
      
      <AdminTripForm />
    </div>
  );
}