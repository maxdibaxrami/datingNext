import { Placeholder } from "@telegram-apps/telegram-ui"

interface Props {
  text?: string;
}

const EmptyData = ({ text }: Props) => {
  return (
    <div>
      <Placeholder description={text ?? 'No data'} header="" >
        <img
          alt="Telegram sticker"
          className="blt0jZBzpxuR4oDhJc8s"
          src="https://xelene.me/telegram.gif"
        />
      </Placeholder>
    </div>
  );
};

export default EmptyData;