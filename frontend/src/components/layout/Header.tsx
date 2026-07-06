import PageHeader from "../ui/PageHeader";

type HeaderProps = {
  title?: string;
  description?: string;
  breadcrumb?: React.ReactNode;
};

/** @deprecated استخدم PageHeader مباشرة — يُبقى للتوافق */
export default function Header({ title, description, breadcrumb }: HeaderProps) {
  return (
    <PageHeader
      title={title ?? "رقيب"}
      description={description}
      breadcrumb={breadcrumb}
    />
  );
}
