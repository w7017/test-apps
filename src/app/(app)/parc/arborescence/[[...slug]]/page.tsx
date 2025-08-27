import HierarchyNavigator from "../hierarchy-navigator";

export default function Page({ params }: { params: { slug: string[] } }) {
  return <HierarchyNavigator slug={params.slug || []} />;
}
