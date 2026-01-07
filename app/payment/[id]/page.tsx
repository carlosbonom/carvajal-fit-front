import PaymentPageClient from "./payment-page-client";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function PaymentPage({ params }: PageProps) {
    const { id } = await params;

    return <PaymentPageClient id={id} />;
}
