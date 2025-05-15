import { 
  PageHeader, 
  PageHeaderTitle, 
  PageHeaderDescription 
} from "./page-header";

interface PageTitleProps {
  title: string;
  description?: string;
}

// Keeping this for backward compatibility
export function PageTitle({ title, description }: PageTitleProps) {
  return (
    <PageHeader>
      <PageHeaderTitle>{title}</PageHeaderTitle>
      {description && (
        <PageHeaderDescription>{description}</PageHeaderDescription>
      )}
    </PageHeader>
  );
} 