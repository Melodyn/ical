import React from 'react';
import {
  // eslint-disable-next-line
  Root, Epic, Tabbar, TabbarItem,
  Group, Panel, PanelHeader, SimpleCell, View,
} from '@vkontakte/vkui';
import {
  Icon16ArrowTriangleDown,
  Icon16ArrowTriangleUp,
  Icon16Play,
  Icon16ChevronLeft,
} from '@vkontakte/icons';
import { useLocation } from '@happysanta/router';
import {
  views, panels, router, routes,
} from './router.js';

// const onClick = (route) => () => router.pushPage(route);
// const onBack = () => () => router.popPage();

// const Main = () => {
//   const location = useLocation();
//
//   return (
//     <View id={views.MAIN} activePanel={location.getViewActivePanel(views.MAIN)}>
//       <Panel id={panels.MAIN}>
//         <PanelHeader>Main</PanelHeader>
//         <Group>
//           <SimpleCell onClick={onClick(routes.KITTY)}>Kitty</SimpleCell>
//           <SimpleCell onClick={onClick(routes.WORLD)}>World</SimpleCell>
//         </Group>
//       </Panel>
//       <Panel id={panels.KITTY}>
//         <PanelHeader>Hello Kitty</PanelHeader>
//         <Group>
//           <SimpleCell onClick={onClick(routes.MAIN)}>Hello</SimpleCell>
//           <SimpleCell onClick={onClick(routes.WORLD)}>World</SimpleCell>
//           <SimpleCell onClick={onBack()}>back</SimpleCell>
//         </Group>
//       </Panel>
//       <Panel id={panels.WORLD}>
//         <PanelHeader>Hello World</PanelHeader>
//         <Group>
//           <SimpleCell onClick={onClick(routes.MAIN)}>Hello</SimpleCell>
//           <SimpleCell onClick={onClick(routes.KITTY)}>Kitty</SimpleCell>
//           <SimpleCell onClick={onBack()}>back</SimpleCell>
//         </Group>
//       </Panel>
//     </View>
//   );
// };

// const Main = () => {
//   const location = useLocation();
//
//   return (
//     <Root activeView={location.getViewId()}>
//       <View
//         id={views.MAIN}
//         onSwipeBack={onBack()}
//         activePanel={location.getViewActivePanel(views.MAIN)}
//         history={location.hasOverlay() ? [] : location.getViewHistory(views.MAIN)}
//       >
//         <Panel id={panels.MAIN}>
//           <PanelHeader>Main</PanelHeader>
//           <Group>
//             <SimpleCell onClick={onClick(routes.KITTY)}>Kitty</SimpleCell>
//             <SimpleCell onClick={onClick(routes.WORLD)}>World</SimpleCell>
//           </Group>
//         </Panel>
//       </View>
//       <View
//         id={views.KITTY}
//         onSwipeBack={onBack()}
//         activePanel={location.getViewActivePanel(views.KITTY)}
//         history={location.hasOverlay() ? [] : location.getViewHistory(views.MAIN)}
//       >
//         <Panel id={panels.KITTY}>
//           <PanelHeader>Hello Kitty</PanelHeader>
//           <Group>
//             <SimpleCell onClick={onClick(routes.MAIN)}>Hello</SimpleCell>
//             <SimpleCell onClick={onClick(routes.WORLD)}>World</SimpleCell>
//             <SimpleCell onClick={onBack()}>back</SimpleCell>
//           </Group>
//         </Panel>
//       </View>
//       <View
//         id={views.WORLD}
//         onSwipeBack={onBack()}
//         activePanel={location.getViewActivePanel(views.WORLD)}
//         history={location.hasOverlay() ? [] : location.getViewHistory(views.MAIN)}
//       >
//         <Panel id={panels.WORLD}>
//           <PanelHeader>Hello World</PanelHeader>
//           <Group>
//             <SimpleCell onClick={onClick(routes.MAIN)}>Hello</SimpleCell>
//             <SimpleCell onClick={onClick(routes.KITTY)}>Kitty</SimpleCell>
//             <SimpleCell onClick={onBack()}>back</SimpleCell>
//           </Group>
//         </Panel>
//       </View>
//     </Root>
//   );
// };

const Main = () => {
  const location = useLocation();
  const onStoryChange = (e) => {
    const newStory = e.currentTarget.dataset.story;
    router.pushPage(newStory);
  };
  const onStoryBack = () => {
    router.popPage();
  };
  const viewId = location.getViewId();

  return (
    <Epic
      activeStory={viewId}
      tabbar={(
        <Tabbar>
          <TabbarItem
            onClick={onStoryChange}
            selected={viewId === views.MAIN}
            data-story={routes.MAIN}
            text="Home"
          >
            <Icon16Play width={24} height={24} />
          </TabbarItem>
          <TabbarItem
            onClick={onStoryChange}
            selected={viewId === views.KITTY}
            data-story={routes.KITTY}
            text="Kitty"
          >
            <Icon16ArrowTriangleUp width={24} height={24} />
          </TabbarItem>
          <TabbarItem
            onClick={onStoryChange}
            selected={viewId === views.WORLD}
            data-story={routes.WORLD}
            text="World"
          >
            <Icon16ArrowTriangleDown width={24} height={24} />
          </TabbarItem>
          <TabbarItem
            onClick={onStoryBack}
            text="Back"
          >
            <Icon16ChevronLeft width={24} height={24} />
          </TabbarItem>
        </Tabbar>
    )}
    >
      <View
        id={views.MAIN}
        activePanel={location.getViewActivePanel(views.MAIN)}
        history={location.hasOverlay() ? [] : location.getViewHistory(views.MAIN)}
      >
        <Panel id={panels.MAIN}>
          <PanelHeader>Main</PanelHeader>
          <Group>
            <SimpleCell>Kitty</SimpleCell>
            <SimpleCell>World</SimpleCell>
          </Group>
        </Panel>
      </View>
      <View
        id={views.KITTY}
        activePanel={location.getViewActivePanel(views.KITTY)}
        history={location.hasOverlay() ? [] : location.getViewHistory(views.MAIN)}
      >
        <Panel id={panels.KITTY}>
          <PanelHeader>Hello Kitty</PanelHeader>
          <Group>
            <SimpleCell>Hello</SimpleCell>
            <SimpleCell>Kitty</SimpleCell>
          </Group>
        </Panel>
      </View>
      <View
        id={views.WORLD}
        activePanel={location.getViewActivePanel(views.WORLD)}
        history={location.hasOverlay() ? [] : location.getViewHistory(views.MAIN)}
      >
        <Panel id={panels.WORLD}>
          <PanelHeader>Hello World</PanelHeader>
          <Group>
            <SimpleCell>Hello</SimpleCell>
            <SimpleCell>World</SimpleCell>
          </Group>
        </Panel>
      </View>
    </Epic>
  );
};

export default Main;
