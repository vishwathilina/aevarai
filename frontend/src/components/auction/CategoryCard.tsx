import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export interface Category {
  id: string;
  name: string;
  image: string;
  count?: number;
}

interface CategoryCardProps extends React.HTMLAttributes<HTMLAnchorElement> {
  category: Category;
}

const CategoryCard = ({ category, className, ...props }: CategoryCardProps) => {
  return (
    <Link
      to={`/category/${category.id}`}
      className={cn("category-card group", className)}
      {...props}
    >
      <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      <span className="text-sm font-medium text-foreground text-center">
        {category.name}
      </span>
    </Link>
  );
};

export default CategoryCard;
