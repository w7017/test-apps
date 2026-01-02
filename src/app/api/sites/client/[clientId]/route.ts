// src/app/api/sites/client/[clientId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchSitesByClientIdWithFullHierarchy } from "@/services/site.service";

export async function GET(
  req: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    console.log("GET /api/sites/client/[clientId] - Starting with clientId:", params.clientId);
    
    // Extract query parameters for advanced filtering
    const searchParams = req.nextUrl.searchParams;
    const filters = {
      estPlanifie: searchParams.get('estPlanifie'),
      avancement: searchParams.getAll('avancement'),
      codeClient: searchParams.get('codeClient'),
      city: searchParams.get('city'),
      postalCode: searchParams.get('postalCode'),
    };
    
    console.log("Filters received:", filters);
    
    let sites = await fetchSitesByClientIdWithFullHierarchy(params.clientId);
    
    // Apply filters
    if (filters.estPlanifie !== null) {
      const isPlanified = filters.estPlanifie === 'true';
      sites = sites.filter(site => site.estPlanifie === isPlanified);
    }
    
    if (filters.avancement.length > 0) {
      sites = sites.filter(site => filters.avancement.includes(site.avancement));
    }
    
    if (filters.codeClient) {
      const searchTerm = filters.codeClient.toLowerCase();
      sites = sites.filter(site => 
        site.codeClient?.toLowerCase().includes(searchTerm)
      );
    }
    
    if (filters.city) {
      const searchTerm = filters.city.toLowerCase();
      sites = sites.filter(site => {
        const address = site.address?.toLowerCase() || '';
        return address.includes(searchTerm);
      });
    }
    
    if (filters.postalCode) {
      const searchTerm = filters.postalCode;
      sites = sites.filter(site => {
        const address = site.address || '';
        return address.includes(searchTerm);
      });
    }
    
    console.log("GET /api/sites/client/[clientId] - Success:", sites.length, "sites found after filtering");
    return NextResponse.json(sites);
  } catch (error: any) {
    console.error("GET /api/sites/client/[clientId] - Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch sites for client" },
      { status: 500 }
    );
  }
}