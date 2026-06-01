import { ChevronRightIcon } from '@heroicons/react/24/outline';
import {
  Avatar,
  Typography,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from '@material-tailwind/react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import wikiProfilePic from '../../../../assets/images/wiki-profile-pic.webp';
import Button from 'src/app/ui/Button';

interface Expert {
  contact_email: string;
  phone_number: string;
  profile_picture?: string;
  public_name: string;
}

interface Content {
  id: string;
  short_description: string;
  public_image: string;
  description: string;
}

const ExpertsList = (props: any) => {
  const { experts } = props;
  const [open, setOpen] = useState(false);
  const [expert, setExpert] = useState<Expert>();
  const handleOpen = (expert: Expert) => {
    setOpen(!open);
    setExpert(expert);
  };

  const loadingCards = [...Array(3)].map((_, i) => (
    <div
      key={i}
      className="animate-pulse flex border border-white/5 rounded-2xl overflow-hidden bg-white/5 my-4 p-4 items-center"
    >
      <div className="overflow-hidden rounded-full h-16 w-16 bg-gray-700"></div>
      <div className="flex-1 px-4 space-y-4 py-1">
        <div className="h-4 bg-gray-700 rounded"></div>
        <div className="h-4 bg-gray-700 rounded w-5/6"></div>
        <div className="h-4 bg-gray-700 rounded"></div>
      </div>
    </div>
  ));

  return (
    <>
      <h2 className="text-base font-bold">Experts to talk to </h2>

      <div className="max-h-[500px] overflow-y-auto">
        {!experts && loadingCards}
        {experts?.map((expert: Expert) => (
          <div
            key={expert.public_name}
            onClick={() => {
              handleOpen(expert);
            }}
            className="flex cursor-pointer border border-white/5 rounded-2xl overflow-hidden bg-white/5 my-4 p-4 items-center"
          >
            <div>
              <Avatar
                variant="circular"
                alt="candice"
                className=" h-16 w-16"
                src={expert.profile_picture ?? wikiProfilePic}
              />
            </div>
            <div>
              <Typography className="text-base font-medium p-4">
                {expert.public_name}
              </Typography>
            </div>
          </div>
        ))}
      </div>
      <ContactDialog
        user={expert}
        open={open}
        handleOpen={handleOpen}
      ></ContactDialog>
    </>
  );
};

const ContentsList = (props: any) => {
  let { contents } = props;

  const loadingCards = [...Array(3)].map((_, i) => (
    <div
      key={i}
      className="animate-pulse flex border border-white/5 rounded-2xl overflow-hidden bg-white/5 my-4"
    >
      <div className="w-52 flex-shrink-0 bg-gray-700"></div>
      <div className="w-full p-6">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  ));

  return (
    <>
      <h2 className="text-base font-bold">Content to check</h2>
      <div className="max-h-[500px] overflow-y-auto">
        {!contents && loadingCards}
        {contents?.map((content: Content) => (
          <Link
            to={`/explorer/${content.id}`}
            key={content.id}
            state={{ background: location }}
          >
            <div
              key={content.id}
              className="flex border border-white/5 rounded-2xl overflow-hidden bg-white/5 my-4"
            >
              <div className=" w-24 md:w-52  flex-shrink-0">
                <img
                  alt={content.short_description}
                  src={content.public_image}
                  className="object-cover h-full"
                />
              </div>
              <div className="p-3 md:px-6 md:py-4 w-full">
                <Typography className="font-bold text-xl">
                  {content.short_description}
                </Typography>
                <Typography className="h-24 md:h-20 tracking-tighter mt-2 text-base font-medium line-height-2 text-white/60">
                  {content.description.slice(0, 110)}
                  {content.description.length > 110 && '...'}
                </Typography>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
};

const ContactDialog = (props: any) => {
  const { user, open, handleOpen } = props;

  return (
    user && (
      <>
        <Dialog
          open={open}
          handler={handleOpen}
          animate={{
            mount: { scale: 1, y: 0 },
            unmount: { scale: 0.9, y: -100 },
          }}
          className="bg-dark-600/95"
        >
          <DialogHeader className="text-label">Contact</DialogHeader>
          <DialogBody divider>
            {user && (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2 text-800">
                  <Typography variant="h6">Email: </Typography>
                  <Typography variant="paragraph">
                    {user.contact_email ?? 'N/A'}
                  </Typography>
                </div>
                <div className="flex gap-2 text-800">
                  <Typography variant="h6">Phone: </Typography>
                  <Typography variant="paragraph">
                    {user.phone_number ?? 'N/A'}
                  </Typography>
                </div>
                <div className="flex gap-2 text-800">
                  <Typography variant="h6">Porfolio Link: </Typography>
                  <Typography variant="paragraph">
                    {user.portfolio_link && (
                      <a href={user.porfolio_link}>Link</a>
                    )}
                    {!user.portfolio_link && 'N/A'}
                  </Typography>
                </div>
              </div>
            )}
          </DialogBody>
          <DialogFooter>
            <Button variant="danger" onClick={handleOpen}>
              <span>Close</span>
            </Button>
          </DialogFooter>
        </Dialog>
      </>
    )
  );
};

const Actions = (props: any) => {
  const { expertsQuery, contentsQuery, isQuizCompleted } = props;

  const { data: experts, isFetching: isFetchingExperts } = expertsQuery;
  const { data: contents, isFetching: isFetchingContents } = contentsQuery;

  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col justify-between">
      <h2 className="text-3xl not-italic font-bold mb-10">
        Recomendaciones (no exhaustiva)
      </h2>
      <div className="container mx-auto">
        {isQuizCompleted ? (
          <div className="grid lg:grid-cols-2 md:grid-cols-1 gap-10">
            <div>
              <ContentsList contents={contents}></ContentsList>
            </div>
            <div>
              <ExpertsList experts={experts?.expert_profiles}></ExpertsList>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-start p-6 lg:w-1/3 border border-white/5 rounded-2xl overflow-hidden bg-white/5">
            <p className="text-base mb-6">
              Unlock your full potential! Take our quick digital survey to help
              us understand your needs and enhance your skills.
            </p>
            <Button
              type="submit"
              variant="secondary"
              chevron
              onClick={() => {
                navigate('./selector');
              }}
            >
              Selecciona un Quiz
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
export default Actions;
