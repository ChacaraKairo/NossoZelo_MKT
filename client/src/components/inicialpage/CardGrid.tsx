import Card from './Cards';
import ImagesCard from './scripts/ImagesCard';
import Style from './styles/Grid.module.css';

const CardGrid = () => {
  return (
    <div className={Style.grid}>
      {ImagesCard.map((item) => (
        <Card key={item.id} item={item} />
      ))}
    </div>
  );
};

export default CardGrid;
